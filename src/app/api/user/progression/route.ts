import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MEMBERSHIP_ROLES } from '@/lib/constants';
import type { MembershipRole } from '@/lib/services/role-progression';

/**
 * GET /api/user/progression
 * Returns complete progression page data:
 * - Current role info
 * - All 8 roles mapped with isPast/isCurrent/isFuture
 * - Auto-generated tasks
 * - User streak data
 * - Recent achievements
 * - Uncelebrated milestones
 * - Role progress from get_user_role_progress()
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, membership_role, staff_role')
      .eq('clerk_id', authUser.id)
      .single();

    if (userError || !dbUser) {
      console.error('[Progression] Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current role info
    const currentRoleInfo = MEMBERSHIP_ROLES[dbUser.membership_role as MembershipRole];

    // Build role journey (all 8 roles with status)
    const roleJourney = Object.values(MEMBERSHIP_ROLES)
      .sort((a, b) => a.level - b.level)
      .map(role => ({
        role: role.key,
        level: role.level,
        displayName: role.label,
        icon: role.icon,
        isPast: role.level < currentRoleInfo.level,
        isCurrent: role.level === currentRoleInfo.level,
        isFuture: role.level > currentRoleInfo.level,
      }));

    // Get progression tasks
    let { data: tasks, error: tasksError } = await supabase
      .from('progression_tasks')
      .select('*')
      .eq('user_id', dbUser.id)
      .order('display_order', { ascending: true });

    if (tasksError) {
      console.error('[Progression] Error fetching tasks:', tasksError);
    }

    // Fallback: If no tasks exist, generate them now
    if (!tasks || tasks.length === 0) {
      console.log('[Progression] No tasks found, generating for user:', dbUser.id);

      const { error: generateError } = await supabase.rpc('generate_progression_tasks', {
        p_user_id: dbUser.id
      });

      if (generateError) {
        console.error('[Progression] Failed to generate tasks:', generateError);
      } else {
        // Fetch the newly generated tasks
        const { data: newTasks } = await supabase
          .from('progression_tasks')
          .select('*')
          .eq('user_id', dbUser.id)
          .order('display_order', { ascending: true });

        tasks = newTasks || [];
      }
    }

    // Transform tasks for frontend
    const transformedTasks = (tasks || []).map(task => ({
      id: task.id,
      title: task.title_uk,
      description: task.description_uk,
      ctaText: task.cta_text_uk,
      ctaUrl: task.cta_url,
      icon: task.icon_name,
      current: task.current_value,
      target: task.target_value,
      isCompleted: task.is_completed,
      progressPercent: Math.min(100, Math.round((task.current_value / task.target_value) * 100)),
      requirementType: task.requirement_type,
    }));

    // Split into incomplete and completed
    const incompleteTasks = transformedTasks.filter(t => !t.isCompleted);
    const completedTasks = transformedTasks.filter(t => t.isCompleted);

    // Get streak data
    const { data: streak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', dbUser.id)
      .single();

    if (streakError && streakError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[Progression] Error fetching streak:', streakError);
    }

    // Calculate next streak milestone
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    const currentStreak = streak?.current_streak || 0;
    const nextMilestone = milestones.find(m => m > currentStreak) || 365;

    const streakData = {
      current: streak?.current_streak || 0,
      longest: streak?.longest_streak || 0,
      totalDays: streak?.total_days || 0,
      nextMilestone,
      daysUntilMilestone: Math.max(0, nextMilestone - currentStreak),
    };

    // Get recent achievements (last 10)
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', dbUser.id)
      .order('earned_at', { ascending: false })
      .limit(10);

    if (achievementsError) {
      console.error('[Progression] Error fetching achievements:', achievementsError);
    }

    const transformedAchievements = (achievements || []).map(achievement => ({
      id: achievement.id,
      key: achievement.achievement_key,
      title: achievement.title_uk,
      description: achievement.description_uk,
      icon: achievement.icon_name,
      earnedAt: achievement.earned_at,
    }));

    // Get uncelebrated milestones
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('progression_milestones')
      .select('*')
      .eq('user_id', dbUser.id)
      .eq('is_celebrated', false)
      .order('created_at', { ascending: true })
      .limit(5);

    if (milestonesError) {
      console.error('[Progression] Error fetching milestones:', milestonesError);
    }

    const uncelebratedMilestones = (milestonesData || []).map(milestone => ({
      id: milestone.id,
      type: milestone.milestone_type,
      title: milestone.title_uk,
      message: milestone.message_uk,
      createdAt: milestone.created_at,
    }));

    // Get role progress from existing function
    const { data: progressData, error: progressError } = await supabase
      .rpc('get_user_role_progress', { target_user_id: dbUser.id });

    if (progressError) {
      console.error('[Progression] Error from get_user_role_progress:', progressError);
    }

    let roleProgress = null;
    if (progressData && progressData.length > 0) {
      const row = progressData[0];
      roleProgress = {
        currentRole: row.curr_role,
        currentRoleLevel: row.current_role_level,
        currentRoleLabel: row.current_role_name_uk,
        nextRole: row.next_role,
        nextRoleLevel: row.next_role_level,
        nextRoleLabel: row.next_role_name_uk,
        isEligible: row.is_eligible,
        progressPercent: row.progress_percent,
      };
    }

    // Calculate new privileges for next role
    const newPrivileges: string[] = [];
    if (roleProgress?.nextRole) {
      const nextRoleInfo = MEMBERSHIP_ROLES[roleProgress.nextRole as MembershipRole];
      const currentPrivileges = (currentRoleInfo.privileges || []) as readonly string[];
      const nextPrivileges = (nextRoleInfo.privileges || []) as readonly string[];

      nextPrivileges.forEach(priv => {
        if (!currentPrivileges.includes(priv as any)) {
          newPrivileges.push(priv);
        }
      });
    }

    // Build response
    return NextResponse.json({
      success: true,
      data: {
        currentRole: {
          role: dbUser.membership_role,
          level: currentRoleInfo.level,
          displayName: currentRoleInfo.label,
          description: currentRoleInfo.description,
          icon: currentRoleInfo.icon,
          color: currentRoleInfo.color,
        },
        roleJourney,
        tasks: transformedTasks,
        incompleteTasks,
        completedTasks,
        streak: streakData,
        achievements: transformedAchievements,
        milestones: uncelebratedMilestones,
        progress: roleProgress,
        newPrivileges,
      },
    });

  } catch (error) {
    console.error('[Progression] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
