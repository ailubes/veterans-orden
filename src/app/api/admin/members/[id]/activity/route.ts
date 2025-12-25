import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';

export interface ActivityItem {
  id: string;
  type: 'event' | 'vote' | 'task' | 'points' | 'profile' | 'other';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
  metadata?: Record<string, unknown>;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const adminProfile = await getAdminProfile();

    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: memberId } = await context.params;

    // Fetch all activity sources in parallel
    const [
      { data: eventRsvps },
      { data: voteSubmissions },
      { data: taskClaims },
      { data: activityLog },
    ] = await Promise.all([
      // Event RSVPs
      supabase
        .from('event_rsvps')
        .select('id, created_at, event:events(id, title)')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50),

      // Vote submissions
      supabase
        .from('vote_submissions')
        .select('id, created_at, vote:votes(id, title)')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50),

      // Task claims
      supabase
        .from('task_claims')
        .select('id, created_at, status, task:tasks(id, title, points_reward)')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50),

      // General activity log
      supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    // Transform all activities into unified format
    const activities: ActivityItem[] = [];

    // Event RSVPs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventRsvps || []).forEach((rsvp: any) => {
      if (rsvp.event && !Array.isArray(rsvp.event)) {
        activities.push({
          id: `event-${rsvp.id}`,
          type: 'event',
          title: 'Зареєструвався на подію',
          description: rsvp.event.title,
          timestamp: rsvp.created_at,
        });
      }
    });

    // Vote submissions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (voteSubmissions || []).forEach((submission: any) => {
      if (submission.vote && !Array.isArray(submission.vote)) {
        activities.push({
          id: `vote-${submission.id}`,
          type: 'vote',
          title: 'Взяв участь у голосуванні',
          description: submission.vote.title,
          timestamp: submission.created_at,
        });
      }
    });

    // Task claims
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (taskClaims || []).forEach((claim: any) => {
      if (claim.task && !Array.isArray(claim.task)) {
        const isCompleted = claim.status === 'completed';
        activities.push({
          id: `task-${claim.id}`,
          type: 'task',
          title: isCompleted ? 'Виконав завдання' : 'Взяв завдання',
          description: claim.task.title,
          timestamp: claim.created_at,
          points: isCompleted ? claim.task.points_reward : undefined,
        });
      }
    });

    // Activity log entries
    (activityLog || []).forEach((log) => {
      // Determine activity type based on action_type
      let type: ActivityItem['type'] = 'other';
      let title = log.action_type;

      if (log.action_type.includes('point')) {
        type = 'points';
        title = 'Отримав бали';
      } else if (log.action_type.includes('profile')) {
        type = 'profile';
        title = 'Оновив профіль';
      }

      activities.push({
        id: `log-${log.id}`,
        type,
        title,
        description: log.description || '',
        timestamp: log.created_at,
        points: log.points_earned || undefined,
        metadata: log.metadata as Record<string, unknown> | undefined,
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit to 100 most recent activities
    const recentActivities = activities.slice(0, 100);

    return NextResponse.json({
      activities: recentActivities,
      total: recentActivities.length,
    });
  } catch (error) {
    console.error('Error fetching member activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
