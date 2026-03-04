import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

type ViewerAccess = {
  canPost: boolean;
  reason: string | null;
  referralCount: number;
  membershipTier: string | null;
  membershipPaidUntil: string | null;
};

const PAID_TIERS = ['basic_49', 'supporter_100', 'supporter_200', 'patron_500'];

function getJobPostingAccess(profile: {
  referral_count?: number | null;
  membership_tier?: string | null;
  membership_paid_until?: string | null;
  status?: string | null;
  staff_role?: string | null;
} | null): ViewerAccess {
  if (!profile) {
    return {
      canPost: false,
      reason: 'Профіль не знайдено',
      referralCount: 0,
      membershipTier: null,
      membershipPaidUntil: null,
    };
  }

  const referralCount = profile.referral_count || 0;
  const membershipTier = profile.membership_tier || null;
  const membershipPaidUntil = profile.membership_paid_until || null;
  const isAdmin = profile.staff_role === 'admin' || profile.staff_role === 'super_admin';
  const isPaidTier = !!membershipTier && PAID_TIERS.includes(membershipTier);
  const hasInvites = referralCount >= 3;
  const isSuspended = profile.status === 'suspended';
  const paidUntilTs = membershipPaidUntil ? new Date(membershipPaidUntil).getTime() : 0;
  const graceThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const hasActivePaidAccess = isPaidTier && paidUntilTs >= graceThreshold;

  if (isAdmin) {
    return {
      canPost: true,
      reason: null,
      referralCount,
      membershipTier,
      membershipPaidUntil,
    };
  }

  if (isSuspended) {
    return {
      canPost: false,
      reason: 'Обліковий запис призупинено',
      referralCount,
      membershipTier,
      membershipPaidUntil,
    };
  }

  if (!isPaidTier) {
    return {
      canPost: false,
      reason: 'Публікація вакансій доступна лише для платних учасників',
      referralCount,
      membershipTier,
      membershipPaidUntil,
    };
  }

  if (!hasActivePaidAccess) {
    return {
      canPost: false,
      reason: 'Потрібна активна платна підписка',
      referralCount,
      membershipTier,
      membershipPaidUntil,
    };
  }

  if (!hasInvites) {
    return {
      canPost: false,
      reason: 'Потрібно мінімум 3 запрошених учасники',
      referralCount,
      membershipTier,
      membershipPaidUntil,
    };
  }

  return {
    canPost: true,
    reason: null,
    referralCount,
    membershipTier,
    membershipPaidUntil,
  };
}

// GET /api/jobs - list job offers and access metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = getJobPostingAccess(profile);

    let query = supabase
      .from('jobs')
      .select(`
        *,
        author:users!jobs_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
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

    const nextCursor = jobs && jobs.length === limit ? jobs[jobs.length - 1].created_at : null;

    return NextResponse.json({
      jobs: formattedJobs,
      nextCursor,
      access,
    });
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/jobs - create job and publish to feed
export async function POST(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUserId = profile?.id || user.id;
    const access = getJobPostingAccess(profile);

    if (!access.canPost) {
      return NextResponse.json({ error: access.reason || 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const companyName = typeof body.company_name === 'string' ? body.company_name.trim() : null;
    const location = typeof body.location === 'string' ? body.location.trim() : null;
    const employmentType = typeof body.employment_type === 'string' ? body.employment_type : 'full_time';
    const salaryMin = Number.isFinite(body.salary_min) ? Number(body.salary_min) : null;
    const salaryMax = Number.isFinite(body.salary_max) ? Number(body.salary_max) : null;
    const applicationUrl = typeof body.application_url === 'string' ? body.application_url.trim() : null;
    const contactEmail = typeof body.contact_email === 'string' ? body.contact_email.trim() : null;
    const contactPhone = typeof body.contact_phone === 'string' ? body.contact_phone.trim() : null;
    const visibility = typeof body.visibility === 'string' ? body.visibility : 'public';

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
    }

    const { data: job, error: createJobError } = await supabase
      .from('jobs')
      .insert({
        author_id: dbUserId,
        title,
        description,
        company_name: companyName,
        location,
        employment_type: employmentType,
        salary_min: salaryMin,
        salary_max: salaryMax,
        application_url: applicationUrl,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        status: 'active',
      })
      .select('*')
      .single();

    if (createJobError || !job) {
      console.error('Error creating job:', createJobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const feedText = [
      `Вакансія: ${title}`,
      companyName ? `Компанія: ${companyName}` : null,
      location ? `Локація: ${location}` : null,
      description,
    ]
      .filter(Boolean)
      .join('\n');

    const { data: post, error: createPostError } = await supabase
      .from('posts')
      .insert({
        author_id: dbUserId,
        content: feedText,
        content_type: 'link',
        visibility,
        link_preview: {
          kind: 'job',
          job_id: job.id,
          title,
          company_name: companyName,
          location,
          employment_type: employmentType,
          salary_min: salaryMin,
          salary_max: salaryMax,
          application_url: applicationUrl,
        },
      })
      .select('id')
      .single();

    if (createPostError || !post) {
      console.error('Error creating feed post for job:', createPostError);
      await supabase.from('jobs').delete().eq('id', job.id);
      return NextResponse.json({ error: 'Failed to publish job to feed' }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ post_id: post.id })
      .eq('id', job.id);

    if (updateError) {
      console.error('Error linking job with post:', updateError);
    }

    const { data: fullJob } = await supabase
      .from('jobs')
      .select(`
        *,
        author:users!jobs_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
      `)
      .eq('id', job.id)
      .single();

    const formattedJob = fullJob
      ? {
          ...fullJob,
          author: {
            ...fullJob.author,
            display_name:
              `${fullJob.author?.first_name || ''} ${fullJob.author?.last_name || ''}`.trim() || 'Користувач',
          },
        }
      : job;

    return NextResponse.json({ job: formattedJob }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
