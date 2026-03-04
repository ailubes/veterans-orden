import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, supabase, error: authError } = await requireAdminUser(request);

    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    let query = supabase
      .from('jobs')
      .select(`
        *,
        author:users!jobs_author_id_fkey(id, first_name, last_name, email),
        post:posts!jobs_post_id_fkey(id, visibility, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('[Admin Jobs GET] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    const formattedJobs = (jobs || []).map((job) => ({
      ...job,
      author: {
        ...job.author,
        display_name:
          `${job.author?.first_name || ''} ${job.author?.last_name || ''}`.trim() || 'Користувач',
      },
    }));

    return NextResponse.json({ jobs: formattedJobs });
  } catch (error) {
    console.error('[Admin Jobs GET] Internal error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
