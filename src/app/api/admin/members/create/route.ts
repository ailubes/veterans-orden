import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { generateReferralCode } from '@/lib/utils';

// Create admin client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Generate a secure random password
function generatePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  const allChars = lowercase + uppercase + numbers + special;

  let password = '';
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * POST /api/admin/members/create
 * Create a new member with Supabase Auth user
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const { profile: adminProfile } = await getAdminProfileFromRequest(request);

    if (adminProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can create members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      patronymic,
      email,
      phone,
      date_of_birth,
      oblast_id,
      city,
      role,
      status,
      membership_tier,
      membership_paid_until,
      points,
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'Ім\'я, прізвище та email обов\'язкові' },
        { status: 400 }
      );
    }

    // Check if email already exists in auth
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUserExists = existingAuthUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (authUserExists) {
      return NextResponse.json(
        { error: 'Користувач з таким email вже існує в системі авторизації' },
        { status: 400 }
      );
    }

    // Check if email exists in users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Користувач з таким email вже існує' },
        { status: 400 }
      );
    }

    // Generate password
    const generatedPassword = generatePassword(12);

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: generatedPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name,
        last_name,
      },
    });

    if (authError || !authUser.user) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: `Помилка створення користувача: ${authError?.message}` },
        { status: 500 }
      );
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let codeExists = true;

    while (codeExists) {
      const { data: existingCode } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (!existingCode) {
        codeExists = false;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Create user in public.users table
    const { data: newMember, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id: authUser.user.id,
        first_name,
        last_name,
        patronymic: patronymic || null,
        email: email.toLowerCase(),
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        oblast_id: oblast_id || null,
        city: city || null,
        role: role || 'full_member',
        status: status || 'active',
        membership_tier: membership_tier || 'free',
        membership_paid_until: membership_paid_until || null,
        points: points || 0,
        level: 1,
        referral_code: referralCode,
        referral_count: 0,
        is_email_verified: true, // Since we confirmed the email
        is_phone_verified: false,
        is_identity_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Rollback: delete the auth user if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      console.error('Error creating user record:', insertError);
      return NextResponse.json(
        { error: `Помилка створення запису: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      member: newMember,
      credentials: {
        email: email.toLowerCase(),
        password: generatedPassword,
      },
      message: 'Користувача створено успішно',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/members/create:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
