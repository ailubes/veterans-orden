import { createClient } from '@/lib/supabase/server';
import { TaskFilters } from '@/components/tasks/task-filters';
import TasksList from '@/components/tasks/tasks-list';

interface PageProps {
  searchParams: Promise<{ type?: string; priority?: string }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeFilter = params.type || '';
  const priorityFilter = params.priority || '';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's database profile
  const { data: profile } = await supabase
    .from('users')
    .select('id, points')
    .eq('auth_id', user?.id)
    .single();

  // Build open tasks query with filters
  let openTasksQuery = supabase
    .from('tasks')
    .select('*')
    .eq('status', 'open')
    .is('assignee_id', null);

  if (typeFilter) {
    openTasksQuery = openTasksQuery.eq('type', typeFilter);
  }
  if (priorityFilter) {
    openTasksQuery = openTasksQuery.eq('priority', priorityFilter);
  }

  const { data: openTasks } = await openTasksQuery
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true })
    .limit(20);

  // Fetch user's in-progress and pending review tasks
  const { data: myTasks } = profile
    ? await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', profile.id)
        .in('status', ['in_progress', 'pending_review'])
        .order('due_date', { ascending: true})
    : { data: null };

  // Count completed tasks
  const { count: completedCount } = profile
    ? await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assignee_id', profile.id)
        .eq('status', 'completed')
    : { count: 0 };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="mono text-bronze text-xs tracking-widest mb-2">// ЗАВДАННЯ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
            Мої завдання
          </h1>
        </div>
        <div className="flex gap-2">
          <TaskFilters />
        </div>
      </div>

      <TasksList
        myTasks={myTasks}
        openTasks={openTasks}
        completedCount={completedCount}
        userPoints={profile?.points || null}
      />
    </div>
  );
}
