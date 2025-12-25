import { getAdminProfileFromRequest } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { NextResponse } from 'next/server';

// GET - Fetch organization settings
export async function GET(request: Request) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Fetch all organization settings
    const { data: settings, error } = await supabase
      .from('organization_settings')
      .select('key, value')
      .like('key', 'organization_%');

    if (error) throw error;

    // Transform to key-value object
    const settingsObject: Record<string, string> = {};
    settings?.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error('[Organization Settings GET Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update organization settings
export async function PATCH(request: Request) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Regional leaders cannot edit organization settings
    if (adminProfile.role === 'regional_leader') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Get old settings for audit log
    const { data: oldSettings } = await supabase
      .from('organization_settings')
      .select('key, value')
      .like('key', 'organization_%');

    const oldData: Record<string, string> = {};
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
      action: 'update_organization_settings',
      entityType: 'organization_settings',
      entityId: 'organization',
      oldData,
      newData: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Organization Settings PATCH Error]', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
