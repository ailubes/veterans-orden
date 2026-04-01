import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

const COMMANDERY_TYPES = ['commandery', 'city'] as const;
type CommanderyType = (typeof COMMANDERY_TYPES)[number];

function normalizeCode(rawCode: string) {
  return rawCode
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 20);
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get('mine') === 'true';

    let coordinatorCommanderyIds: string[] = [];

    const baseQuery = supabase
      .from('commanderies')
      .select('id, code, name, type, parent_code, leader_id, katottg_code, settlement_name, hromada_name, raion_name, oblast_name, address, member_count, group_count, description, created_at, updated_at')
      .order('created_at', { ascending: false });

    let data = null;
    let error = null;

    if (mineOnly) {
      const { data: coordinatedRoles } = await supabase
        .from('user_org_roles')
        .select('commandery_id')
        .eq('user_id', profile.id)
        .in('role_type', ['regional_coordinator', 'komandant', 'deputy_commander'])
        .eq('is_active', true)
        .not('commandery_id', 'is', null);

      coordinatorCommanderyIds = Array.from(
        new Set((coordinatedRoles || []).map((row) => row.commandery_id as string))
      );

      const { data: ledCommanderies } = await supabase
        .from('commanderies')
        .select('id')
        .eq('leader_id', profile.id);

      const combinedIds = Array.from(
        new Set([...(ledCommanderies || []).map((row) => row.id as string), ...coordinatorCommanderyIds])
      );

      if (combinedIds.length === 0) {
        data = [];
      } else {
        const result = await baseQuery.in('id', combinedIds);
        data = result.data;
        error = result.error;
      }
    } else {
      const result = await baseQuery;
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('[Commanderies API] Failed to fetch commanderies:', error);
      return NextResponse.json({ error: 'Failed to fetch commanderies' }, { status: 500 });
    }

    return NextResponse.json({
      commanderies: data ?? [],
      currentUserId: profile.id,
      membershipRole: profile.membership_role,
      canCreate: profile.membership_role === 'honorary_member',
      coordinatorCommanderyIds,
    });
  } catch (error) {
    console.error('[Commanderies API] GET unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (profile.membership_role !== 'honorary_member') {
      return NextResponse.json(
        { error: 'Only members with role Почесний Член can create commanderies' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = normalizeText(body?.name);
    const description = normalizeText(body?.description);
    const address = normalizeText(body?.address);
    const katottgCode = normalizeText(body?.katottgCode || body?.katottg_code);
    const requestedType = normalizeText(body?.type).toLowerCase() as CommanderyType;
    const type: CommanderyType = COMMANDERY_TYPES.includes(requestedType)
      ? requestedType
      : 'commandery';
    const code = normalizeCode(String(body?.code || ''));
    const parentCode = normalizeCode(String(body?.parentCode || body?.parent_code || ''));

    if (name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: 'Name must be between 3 and 100 characters' }, { status: 400 });
    }

    if (code.length < 3 || code.length > 20) {
      return NextResponse.json(
        { error: 'Code must be between 3 and 20 characters and contain only A-Z, 0-9, -, _' },
        { status: 400 }
      );
    }

    if (description.length > 1500) {
      return NextResponse.json({ error: 'Description must be at most 1500 characters' }, { status: 400 });
    }

    if (!katottgCode) {
      return NextResponse.json({ error: 'KATOTTG code is required' }, { status: 400 });
    }

    if (address.length > 1000) {
      return NextResponse.json({ error: 'Address must be at most 1000 characters' }, { status: 400 });
    }

    if (type === 'city' && !parentCode) {
      return NextResponse.json({ error: 'City commandery requires parentCode' }, { status: 400 });
    }

    const { data: settlement, error: settlementError } = await supabase
      .from('katottg')
      .select('code, name, category, hromada_name, raion_name, oblast_name')
      .eq('code', katottgCode)
      .single();

    if (settlementError || !settlement) {
      return NextResponse.json({ error: 'Invalid KATOTTG code' }, { status: 400 });
    }

    if (!['M', 'T', 'C', 'X', 'K'].includes(settlement.category)) {
      return NextResponse.json({ error: 'KATOTTG code must point to a settlement' }, { status: 400 });
    }

    if (parentCode) {
      const { data: parent, error: parentError } = await supabase
        .from('commanderies')
        .select('id, code, type')
        .eq('code', parentCode)
        .single();

      if (parentError || !parent) {
        return NextResponse.json({ error: 'Parent commandery not found' }, { status: 400 });
      }

      if (parent.type !== 'commandery') {
        return NextResponse.json({ error: 'Parent must be a top-level commandery' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('commanderies')
      .insert({
        code,
        name,
        type,
        parent_code: parentCode || null,
        leader_id: profile.id,
        katottg_code: settlement.code,
        settlement_name: settlement.name,
        hromada_name: settlement.hromada_name,
        raion_name: settlement.raion_name,
        oblast_name: settlement.oblast_name,
        address: address || null,
        description: description || null,
      })
      .select('id, code, name, type, parent_code, leader_id, katottg_code, settlement_name, hromada_name, raion_name, oblast_name, address, member_count, group_count, description, created_at, updated_at')
      .single();

    if (error) {
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json({ error: 'Commandery with this code already exists' }, { status: 409 });
      }

      console.error('[Commanderies API] Failed to create commandery:', error);
      return NextResponse.json({ error: 'Failed to create commandery' }, { status: 500 });
    }

    return NextResponse.json({ commandery: data }, { status: 201 });
  } catch (error) {
    console.error('[Commanderies API] POST unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
