import { SupabaseClient } from '@supabase/supabase-js';
import { hasAdminAccess } from '@/lib/permissions-utils';

export async function isCommanderyCoordinator(
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  commanderyId: string
): Promise<boolean> {
  if (!userId || !commanderyId) return false;

  const { data: byLeader } = await supabase
    .from('commanderies')
    .select('id')
    .eq('id', commanderyId)
    .eq('leader_id', userId)
    .maybeSingle();

  if (byLeader) return true;

  const { data: byOrgRole } = await supabase
    .from('user_org_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('commandery_id', commanderyId)
    .in('role_type', ['regional_coordinator', 'komandant', 'deputy_commander'])
    .eq('is_active', true)
    .maybeSingle();

  return !!byOrgRole;
}

export function isCommanderyCoordinatorOrAdmin(profile: {
  id: string;
  staff_role?: string | null;
  membership_role?: string | null;
}) {
  const isAdmin = hasAdminAccess(
    profile.staff_role as 'none' | 'news_editor' | 'admin' | 'super_admin' | null,
    profile.membership_role as
      | 'supporter'
      | 'candidate'
      | 'member'
      | 'honorary_member'
      | 'network_leader'
      | 'regional_leader'
      | 'national_leader'
      | 'network_guide'
      | null
  );

  return isAdmin;
}
