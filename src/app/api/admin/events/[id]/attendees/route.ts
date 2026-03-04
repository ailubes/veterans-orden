import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/get-user';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/events/[id]/attendees
 * Returns the full attendee list with personal data.
 * Query params:
 *   status=going|maybe|not_going|all  (default: all)
 *   format=json|csv                   (default: json)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;
    const { supabase, error: authError } = await requireAdminUser(request);

    if (authError || !supabase) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const format = searchParams.get('format') || 'json';

    // Get event title for file name
    const { data: event } = await supabase
      .from('events')
      .select('title, start_date')
      .eq('id', eventId)
      .single();

    // Build RSVP query with full user profile
    let query = supabase
      .from('event_rsvps')
      .select(`
        id,
        status,
        created_at,
        attended_at,
        ticket_purchased,
        user:users(
          id,
          last_name,
          first_name,
          patronymic,
          date_of_birth,
          email,
          phone,
          additional_phone,
          settlement_name,
          hromada_name,
          raion_name,
          oblast_name_katottg,
          city,
          profession,
          education
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: rsvps, error } = await query;

    if (error) {
      console.error('Attendees query error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const attendees = (rsvps || []).map((r: any, index: number) => ({
      number: index + 1,
      last_name: r.user?.last_name || '',
      first_name: r.user?.first_name || '',
      patronymic: r.user?.patronymic || '',
      date_of_birth: r.user?.date_of_birth
        ? new Date(r.user.date_of_birth).toLocaleDateString('uk-UA')
        : '',
      email: r.user?.email || '',
      phone: r.user?.phone || '',
      additional_phone: r.user?.additional_phone || '',
      location: [
        r.user?.settlement_name,
        r.user?.hromada_name,
        r.user?.raion_name,
        r.user?.oblast_name_katottg || r.user?.city,
      ].filter(Boolean).join(', '),
      profession: r.user?.profession || '',
      education: educationLabel(r.user?.education),
      rsvp_status: statusLabel(r.status),
      rsvp_date: new Date(r.created_at).toLocaleDateString('uk-UA'),
      attended: r.attended_at ? 'Так' : 'Ні',
    }));

    if (format === 'csv') {
      const eventDate = event?.start_date
        ? new Date(event.start_date).toLocaleDateString('uk-UA')
        : '';
      const filename = `${slugify(event?.title || 'event')}_${eventDate}_attendees.csv`;

      const headers = [
        '№', 'Прізвище', 'Ім\'я', 'По батькові', 'Дата народження',
        'Email', 'Телефон', 'Додатковий телефон', 'Місце проживання',
        'Професія', 'Освіта', 'Статус RSVP', 'Дата реєстрації', 'Присутній',
      ];

      const rows = attendees.map((a) => [
        a.number, a.last_name, a.first_name, a.patronymic, a.date_of_birth,
        a.email, a.phone, a.additional_phone, a.location,
        a.profession, a.education, a.rsvp_status, a.rsvp_date, a.attended,
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n');

      // BOM for proper UTF-8 in Excel
      const bom = '\uFEFF';

      return new NextResponse(bom + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ attendees, event });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('[GET /api/admin/events/[id]/attendees]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    going: 'Підтвердив',
    maybe: 'Можливо',
    not_going: 'Не прийде',
  };
  return map[status] || status;
}

function educationLabel(education: string | null): string {
  const map: Record<string, string> = {
    secondary: 'Середня',
    vocational: 'Професійна',
    higher: 'Вища',
  };
  return education ? (map[education] || education) : '';
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '')
    .slice(0, 40);
}
