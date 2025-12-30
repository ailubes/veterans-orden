import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MEMBERSHIP_ROLES } from '@/lib/constants';
import type { MembershipRole, RoleProgress, ReferralStats } from '@/lib/services/role-progression';

/**
 * GET /api/user/role-progress
 * Get current user's role and progress toward next level
 * Uses Supabase client instead of Drizzle ORM for Netlify compatibility
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    console.log('[RoleProgress] Auth user ID:', authUser?.id);

    if (!authUser) {
      console.error('[RoleProgress] No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database using Supabase client
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, membership_role, staff_role, role_advanced_at, referral_code, total_referral_count')
      .eq('clerk_id', authUser.id)
      .single();

    console.log('[RoleProgress] DB user lookup result:', { dbUser, userError });

    if (userError || !dbUser) {
      console.error('[RoleProgress] Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get role progress by calling the PostgreSQL function via RPC
    let progress: RoleProgress | null = null;
    try {
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_user_role_progress', { target_user_id: dbUser.id });

      console.log('[RoleProgress] RPC result:', { progressData, progressError });

      if (progressError) {
        console.error('[RoleProgress] Error from get_user_role_progress RPC:', progressError);
      }

      if (!progressError && progressData && progressData.length > 0) {
        const row = progressData[0];
        const currentRoleInfo = MEMBERSHIP_ROLES[row.curr_role as MembershipRole];
        const nextRoleInfo = row.next_role ? MEMBERSHIP_ROLES[row.next_role as MembershipRole] : null;

        // Build requirements array
        const requirements: RoleProgress['requirements'] = [];
        const nextReqs = row.requirements?.next_role_requirements;

        if (nextReqs) {
          // Contribution requirement
          if (nextReqs.requires_contribution) {
            const hasContribution = !row.requirements.missing?.some((m: { type: string }) => m.type === 'contribution');
            requirements.push({
              type: 'contribution',
              label: `Внесок від ${(nextReqs.min_contribution_amount || 4900) / 100} грн`,
              current: hasContribution ? 1 : 0,
              required: 1,
              isMet: hasContribution,
            });
          }

          // Direct referrals requirement
          if (nextReqs.min_direct_referrals > 0) {
            const missing = row.requirements.missing?.find((m: { type: string }) => m.type === 'direct_referrals');
            const atRoleLabel = nextReqs.min_direct_referrals_at_role
              ? MEMBERSHIP_ROLES[nextReqs.min_direct_referrals_at_role as MembershipRole]?.label || ''
              : '';
            requirements.push({
              type: 'direct_referrals',
              label: `${nextReqs.min_direct_referrals} прямих рефералів${atRoleLabel ? ` рівня "${atRoleLabel}"` : ''}`,
              current: missing ? missing.current : nextReqs.min_direct_referrals,
              required: nextReqs.min_direct_referrals,
              isMet: !missing,
              atRole: nextReqs.min_direct_referrals_at_role as MembershipRole,
            });
          }

          // Total referrals requirement
          if (nextReqs.min_total_referrals > 0) {
            const missing = row.requirements.missing?.find((m: { type: string }) => m.type === 'total_referrals');
            requirements.push({
              type: 'total_referrals',
              label: `${nextReqs.min_total_referrals} загальних рефералів у дереві`,
              current: missing ? missing.current : nextReqs.min_total_referrals,
              required: nextReqs.min_total_referrals,
              isMet: !missing,
            });
          }

          // Helped advance requirement
          if (nextReqs.min_helped_advance > 0) {
            const missing = row.requirements.missing?.find((m: { type: string }) => m.type === 'helped_advance');
            const fromLabel = MEMBERSHIP_ROLES[nextReqs.helped_advance_from_role as MembershipRole]?.label || '';
            const toLabel = MEMBERSHIP_ROLES[nextReqs.helped_advance_to_role as MembershipRole]?.label || '';
            requirements.push({
              type: 'helped_advance',
              label: `${nextReqs.min_helped_advance} допомогли перейти з "${fromLabel}" до "${toLabel}"`,
              current: missing ? missing.current : nextReqs.min_helped_advance,
              required: nextReqs.min_helped_advance,
              isMet: !missing,
              fromRole: nextReqs.helped_advance_from_role as MembershipRole,
              toRole: nextReqs.helped_advance_to_role as MembershipRole,
            });
          }
        }

        progress = {
          currentRole: row.curr_role as MembershipRole,
          currentRoleLevel: row.current_role_level,
          currentRoleLabel: row.current_role_name_uk || currentRoleInfo?.label || '',
          nextRole: row.next_role as MembershipRole | null,
          nextRoleLevel: row.next_role_level,
          nextRoleLabel: row.next_role_name_uk || nextRoleInfo?.label || null,
          isEligible: row.is_eligible,
          progressPercent: row.progress_percent,
          requirements,
          privileges: {
            current: [...(currentRoleInfo?.privileges || [])],
            next: [...(nextRoleInfo?.privileges || [])],
          },
        };
      }
    } catch (progressErr) {
      console.error('Error getting role progress:', progressErr);
      // Continue without progress data
    }

    // Get referral stats from the cached table
    let stats: ReferralStats | null = null;
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('user_referral_stats')
        .select('*')
        .eq('user_id', dbUser.id)
        .single();

      if (!statsError && statsData) {
        const directTotal =
          (statsData.direct_supporters || 0) +
          (statsData.direct_candidates || 0) +
          (statsData.direct_members || 0) +
          (statsData.direct_honorary_members || 0) +
          (statsData.direct_network_leaders || 0) +
          (statsData.direct_regional_leaders || 0) +
          (statsData.direct_national_leaders || 0) +
          (statsData.direct_network_guides || 0);

        stats = {
          userId: statsData.user_id,
          directReferrals: {
            supporters: statsData.direct_supporters || 0,
            candidates: statsData.direct_candidates || 0,
            members: statsData.direct_members || 0,
            honoraryMembers: statsData.direct_honorary_members || 0,
            networkLeaders: statsData.direct_network_leaders || 0,
            regionalLeaders: statsData.direct_regional_leaders || 0,
            nationalLeaders: statsData.direct_national_leaders || 0,
            networkGuides: statsData.direct_network_guides || 0,
            total: directTotal,
          },
          totalTreeCount: statsData.total_tree_count || 0,
          helpedAdvance: {
            toCandidate: statsData.helped_to_candidate || 0,
            toMember: statsData.helped_to_member || 0,
            toHonorary: statsData.helped_to_honorary || 0,
            toLeader: statsData.helped_to_leader || 0,
            toRegional: statsData.helped_to_regional || 0,
            toNational: statsData.helped_to_national || 0,
            toGuide: statsData.helped_to_guide || 0,
          },
          lastCalculatedAt: statsData.last_calculated_at ? new Date(statsData.last_calculated_at) : null,
        };
      } else if (statsError && statsError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is okay
        console.error('Error fetching referral stats:', statsError);
      }
    } catch (statsErr) {
      console.error('Error getting referral stats:', statsErr);
      // Continue without stats data
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        membershipRole: dbUser.membership_role,
        staffRole: dbUser.staff_role,
        roleAdvancedAt: dbUser.role_advanced_at,
        referralCode: dbUser.referral_code,
        totalReferralCount: dbUser.total_referral_count,
      },
      progress,
      stats,
    });
  } catch (error) {
    console.error('Error getting role progress:', error);
    return NextResponse.json(
      { error: 'Failed to get role progress' },
      { status: 500 }
    );
  }
}
