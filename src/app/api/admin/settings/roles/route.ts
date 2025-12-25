import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { NextResponse } from 'next/server';

// GET - Fetch users with elevated roles
export async function GET() {
  try {
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Regional leaders cannot access role management
    if (adminProfile.role === 'regional_leader') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    // Fetch users with elevated roles
    const { data: users, error } = await supabase
      .from('users')
      .select('id, clerk_id, first_name, last_name, email, role, referral_count, oblast:oblasts(name)')
      .in('role', ['group_leader', 'regional_leader', 'admin', 'super_admin'])
      .order('role', { ascending: false })
      .order('last_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(users);
  } catch (error) {
    console.error('[Roles GET Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
