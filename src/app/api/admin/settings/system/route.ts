import { createClient } from '@/lib/supabase/server';
import { getAdminProfile, isSuperAdmin } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { NextResponse } from 'next/server';

// GET - Fetch system configuration
export async function GET() {
  try {
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admins can access system config
    if (!isSuperAdmin(adminProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    // Fetch all system settings
    const { data: settings, error } = await supabase
      .from('organization_settings')
      .select('key, value')
      .or('key.like.system_%,key.like.points_%');

    if (error) throw error;

    // Transform to key-value object with proper types
    const configObject: Record<string, boolean | string | number> = {};
    settings?.forEach((setting) => {
      const value = setting.value;
      // Parse value based on type
      if (typeof value === 'boolean') {
        configObject[setting.key] = value;
      } else if (typeof value === 'number') {
        configObject[setting.key] = value;
      } else {
        configObject[setting.key] = value;
      }
    });

    return NextResponse.json(configObject);
  } catch (error) {
    console.error('[System Config GET Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PATCH - Update system configuration
export async function PATCH(request: Request) {
  try {
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admins can update system config
    if (!isSuperAdmin(adminProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Get old settings for audit log
    const { data: oldSettings } = await supabase
      .from('organization_settings')
      .select('key, value')
      .or('key.like.system_%,key.like.points_%');

    const oldData: Record<string, unknown> = {};
    oldSettings?.forEach((s) => {
      oldData[s.key] = s.value;
    });

    // Update each setting
    const updates = Object.entries(body).map(([key, value]) => {
      return supabase
        .from('organization_settings')
        .update({
          value: JSON.stringify(value),
          updated_at: new Date().toISOString(),
          updated_by: adminProfile.id,
        })
        .eq('key', key);
    });

    await Promise.all(updates);

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: 'update_system_config',
      entityType: 'organization_settings',
      entityId: 'system',
      oldData,
      newData: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[System Config PATCH Error]', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
