import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/get-user';

function buildFeedText(input: {
  title: string;
  description: string;
  company_name?: string | null;
  location?: string | null;
}) {
  return [
    `Вакансія: ${input.title}`,
    input.company_name ? `Компанія: ${input.company_name}` : null,
    input.location ? `Локація: ${input.location}` : null,
    input.description,
  ]
    .filter(Boolean)
    .join('\n');
}

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, supabase, error: authError } = await requireAdminUser(request);

    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
    }

    const updates = {
      title,
      description,
      company_name: typeof body.company_name === 'string' ? body.company_name.trim() || null : null,
      location: typeof body.location === 'string' ? body.location.trim() || null : null,
      employment_type: typeof body.employment_type === 'string' ? body.employment_type : 'full_time',
      salary_min: Number.isFinite(body.salary_min) ? Number(body.salary_min) : null,
      salary_max: Number.isFinite(body.salary_max) ? Number(body.salary_max) : null,
      application_url: typeof body.application_url === 'string' ? body.application_url.trim() || null : null,
      contact_email: typeof body.contact_email === 'string' ? body.contact_email.trim() || null : null,
      contact_phone: typeof body.contact_phone === 'string' ? body.contact_phone.trim() || null : null,
      status: body.status === 'closed' ? 'closed' : 'active',
      updated_at: new Date().toISOString(),
    };

    const { data: job, error: updateError } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select('id, post_id')
      .single();

    if (updateError || !job) {
      console.error('[Admin Jobs PUT] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    if (job.post_id) {
      const feedContent = buildFeedText({
        title: updates.title,
        description: updates.description,
        company_name: updates.company_name,
        location: updates.location,
      });

      const { error: updatePostError } = await supabase
        .from('posts')
        .update({
          content: feedContent,
          visibility: body.visibility === 'followers' ? 'followers' : body.visibility === 'private' ? 'private' : 'public',
          link_preview: {
            kind: 'job',
            job_id: id,
            title: updates.title,
            company_name: updates.company_name,
            location: updates.location,
            employment_type: updates.employment_type,
            salary_min: updates.salary_min,
            salary_max: updates.salary_max,
            application_url: updates.application_url,
          },
          updated_at: new Date().toISOString(),
          is_hidden: updates.status === 'closed',
        })
        .eq('id', job.post_id);

      if (updatePostError) {
        console.error('[Admin Jobs PUT] Update linked post error:', updatePostError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Jobs PUT] Internal error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, supabase, error: authError } = await requireAdminUser(request);

    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Forbidden' }, { status: 403 });
    }

    const { data: job } = await supabase
      .from('jobs')
      .select('post_id')
      .eq('id', id)
      .single();

    const { error: deleteJobError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (deleteJobError) {
      console.error('[Admin Jobs DELETE] Job delete error:', deleteJobError);
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    if (job?.post_id) {
      const { error: deletePostError } = await supabase
        .from('posts')
        .delete()
        .eq('id', job.post_id);

      if (deletePostError) {
        console.error('[Admin Jobs DELETE] Linked post delete error:', deletePostError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Jobs DELETE] Internal error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
