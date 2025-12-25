import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { NextResponse } from 'next/server';

// GET - Fetch all oblasts with member counts and regional leaders
export async function GET() {
  try {
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch all oblasts
    const { data: oblasts, error: oblastsError } = await supabase
      .from('oblasts')
      .select('id, code, name')
      .order('name', { ascending: true });

    if (oblastsError) throw oblastsError;

    // For each oblast, get member count and regional leaders
    const oblastsWithData = await Promise.all(
      (oblasts || []).map(async (oblast) => {
        // Get member count for this oblast
        const { count: memberCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('oblast_id', oblast.id);

        // Get regional leaders for this oblast
        const { data: regionalLeaders } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .eq('oblast_id', oblast.id)
          .eq('role', 'regional_leader');

        return {
          ...oblast,
          member_count: memberCount || 0,
          regional_leaders: regionalLeaders || [],
        };
      })
    );

    // Get total member count
    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      oblasts: oblastsWithData,
      totalMembers: totalMembers || 0,
    });
  } catch (error) {
    console.error('[Oblasts GET Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch oblasts' },
      { status: 500 }
    );
  }
}
