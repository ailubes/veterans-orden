import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { MessagingSettings } from '@/types/messaging';

export const dynamic = 'force-dynamic';

// Admin-level roles that can manage messaging settings
const ADMIN_ROLES = ['national_leader', 'network_guide'];

/**
 * GET /api/admin/settings/messaging
 * Get all messaging settings
 */
export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, membership_role')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check admin permission
    if (!ADMIN_ROLES.includes(profile.membership_role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get messaging settings
    const { data: settingsRows, error } = await supabase
      .from('organization_settings')
      .select('key, value')
      .like('key', 'messaging_%');

    if (error) {
      console.error('[Admin] Error fetching messaging settings:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Build settings object with defaults
    const settings: MessagingSettings = {
      messaging_enabled: true,
      messaging_dm_enabled: true,
      messaging_group_chat_enabled: true,
      messaging_dm_initiator_roles: ['network_leader', 'regional_leader', 'national_leader', 'network_guide'],
      messaging_group_creator_roles: ['network_leader', 'regional_leader', 'national_leader', 'network_guide'],
      messaging_same_group_enabled: false,
      messaging_cross_group_enabled: false,
      messaging_attachments_enabled: true,
      messaging_max_attachment_size_mb: 10,
      messaging_allowed_attachment_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
      messaging_rate_limit_messages_per_minute: 30,
      messaging_max_group_participants: 100,
      messaging_edit_window_minutes: 15,
    };

    // Override with actual values from DB
    for (const row of settingsRows || []) {
      const key = row.key as keyof MessagingSettings;
      if (key in settings) {
        try {
          (settings as unknown as Record<string, unknown>)[key] = JSON.parse(row.value as string);
        } catch {
          // Keep default
        }
      }
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[Admin] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/settings/messaging
 * Update messaging settings
 */
export async function PATCH(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, membership_role')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check admin permission
    if (!ADMIN_ROLES.includes(profile.membership_role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Valid setting keys
    const validKeys: (keyof MessagingSettings)[] = [
      'messaging_enabled',
      'messaging_dm_enabled',
      'messaging_group_chat_enabled',
      'messaging_dm_initiator_roles',
      'messaging_group_creator_roles',
      'messaging_same_group_enabled',
      'messaging_cross_group_enabled',
      'messaging_attachments_enabled',
      'messaging_max_attachment_size_mb',
      'messaging_allowed_attachment_types',
      'messaging_rate_limit_messages_per_minute',
      'messaging_max_group_participants',
      'messaging_edit_window_minutes',
    ];

    const updates: { key: string; value: string }[] = [];

    for (const key of validKeys) {
      if (body[key] !== undefined) {
        // Validate specific fields
        if (key === 'messaging_max_attachment_size_mb') {
          const size = Number(body[key]);
          if (isNaN(size) || size < 1 || size > 100) {
            return NextResponse.json(
              { error: 'Invalid attachment size. Must be between 1 and 100 MB.' },
              { status: 400 }
            );
          }
        }

        if (key === 'messaging_rate_limit_messages_per_minute') {
          const limit = Number(body[key]);
          if (isNaN(limit) || limit < 1 || limit > 100) {
            return NextResponse.json(
              { error: 'Invalid rate limit. Must be between 1 and 100 messages per minute.' },
              { status: 400 }
            );
          }
        }

        if (key === 'messaging_max_group_participants') {
          const max = Number(body[key]);
          if (isNaN(max) || max < 2 || max > 1000) {
            return NextResponse.json(
              { error: 'Invalid max participants. Must be between 2 and 1000.' },
              { status: 400 }
            );
          }
        }

        if (key === 'messaging_edit_window_minutes') {
          const minutes = Number(body[key]);
          if (isNaN(minutes) || minutes < 0 || minutes > 1440) {
            return NextResponse.json(
              { error: 'Invalid edit window. Must be between 0 and 1440 minutes.' },
              { status: 400 }
            );
          }
        }

        if (key === 'messaging_dm_initiator_roles' || key === 'messaging_group_creator_roles') {
          if (!Array.isArray(body[key])) {
            return NextResponse.json(
              { error: `${key} must be an array of roles` },
              { status: 400 }
            );
          }
        }

        if (key === 'messaging_allowed_attachment_types') {
          if (!Array.isArray(body[key])) {
            return NextResponse.json(
              { error: 'messaging_allowed_attachment_types must be an array' },
              { status: 400 }
            );
          }
        }

        updates.push({
          key,
          value: JSON.stringify(body[key]),
        });
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid settings to update' }, { status: 400 });
    }

    // Upsert settings
    for (const { key, value } of updates) {
      const { error: upsertError } = await supabase
        .from('organization_settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (upsertError) {
        console.error(`[Admin] Error updating setting ${key}:`, upsertError);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
      }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: profile.id,
      action: 'update_messaging_settings',
      entity_type: 'organization_settings',
      entity_id: null,
      metadata: {
        updated_keys: updates.map((u) => u.key),
      },
    });

    return NextResponse.json({
      success: true,
      updated: updates.map((u) => u.key),
    });
  } catch (error) {
    console.error('[Admin] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
