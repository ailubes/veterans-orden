import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    const { data: member, error: dbError } = await supabase
      .from('users')
      .select(
        `
        *,
        oblast:oblasts(id, name, code)
      `
      )
      .eq('auth_id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching member:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no member found, return basic info from auth
    if (!member) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        isOnboarded: false,
      });
    }

    return NextResponse.json({
      ...member,
      isOnboarded: true,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName, lastName, city, oblastId, bio,
      phone, additionalPhone, hasViber, hasWhatsapp, hasSignal,
      facebookUrl, education, profession,
      militaryUnit, position, memberIdentity,
      katottgCode, settlementName, hromadaName, raionName, oblastNameKatottg,
    } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (city !== undefined) updateData.city = city;
    if (oblastId !== undefined) updateData.oblast_id = oblastId;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (additionalPhone !== undefined) updateData.additional_phone = additionalPhone;
    if (hasViber !== undefined) updateData.has_viber = hasViber;
    if (hasWhatsapp !== undefined) updateData.has_whatsapp = hasWhatsapp;
    if (hasSignal !== undefined) updateData.has_signal = hasSignal;
    if (facebookUrl !== undefined) updateData.facebook_url = facebookUrl;
    if (education !== undefined) updateData.education = education;
    if (profession !== undefined) updateData.profession = profession;
    if (militaryUnit !== undefined) updateData.military_unit = militaryUnit;
    if (position !== undefined) updateData.position = position;
    if (memberIdentity !== undefined) updateData.member_identity = memberIdentity;
    if (katottgCode !== undefined) updateData.katottg_code = katottgCode;
    if (settlementName !== undefined) updateData.settlement_name = settlementName;
    if (hromadaName !== undefined) updateData.hromada_name = hromadaName;
    if (raionName !== undefined) updateData.raion_name = raionName;
    if (oblastNameKatottg !== undefined) updateData.oblast_name_katottg = oblastNameKatottg;

    // Update user profile
    const { data, error: dbError } = await supabase
      .from('users')
      .update(updateData)
      .eq('auth_id', user.id)
      .select()
      .single();

    if (dbError) {
      console.error('Error updating member:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
