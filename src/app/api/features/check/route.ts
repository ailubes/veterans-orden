import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MEMBERSHIP_ROLES } from '@/lib/constants';
import type { MembershipRole } from '@/lib/services/role-progression';

/**
 * POST /api/features/check
 * Checks if user has access to a specific feature based on their role
 *
 * Request body: { featureKey: string }
 * Response: { unlocked: boolean, displayName: string, description: string, requiredRole: string, currentRole: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { featureKey } = body;

    if (!featureKey || typeof featureKey !== 'string') {
      return NextResponse.json(
        { error: 'featureKey is required and must be a string' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, membership_role')
      .eq('auth_id', authUser.id)
      .single();

    if (userError || !dbUser) {
      console.error('[FeatureCheck] Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get feature gate
    const { data: featureGate, error: gateError } = await supabase
      .from('feature_gates')
      .select('*')
      .eq('feature_key', featureKey)
      .single();

    if (gateError) {
      if (gateError.code === 'PGRST116') {
        // Feature not found - default to unlocked (no restriction)
        return NextResponse.json({
          unlocked: true,
          displayName: featureKey,
          description: 'Функція доступна',
          requiredRole: null,
          currentRole: dbUser.membership_role,
        });
      }
      console.error('[FeatureCheck] Error fetching feature gate:', gateError);
      return NextResponse.json(
        { error: 'Failed to check feature access' },
        { status: 500 }
      );
    }

    // Compare role levels
    const currentRoleInfo = MEMBERSHIP_ROLES[dbUser.membership_role as MembershipRole];
    const requiredRoleInfo = MEMBERSHIP_ROLES[featureGate.required_role as MembershipRole];

    const unlocked = currentRoleInfo.level >= requiredRoleInfo.level;

    return NextResponse.json({
      unlocked,
      displayName: featureGate.display_name_uk,
      description: featureGate.description_uk,
      requiredRole: featureGate.required_role,
      requiredRoleLabel: requiredRoleInfo.label,
      requiredRoleLevel: requiredRoleInfo.level,
      currentRole: dbUser.membership_role,
      currentRoleLabel: currentRoleInfo.label,
      currentRoleLevel: currentRoleInfo.level,
    });

  } catch (error) {
    console.error('[FeatureCheck] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
