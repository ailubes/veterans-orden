import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { getAllEmailTemplates } from '@/lib/email-templates';

/**
 * GET /api/admin/email-templates
 * Get all email templates
 */
export async function GET(request: NextRequest) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const templates = await getAllEmailTemplates();

    // Transform snake_case to camelCase for frontend
    const transformedTemplates = templates.map((t: any) => ({
      id: t.id,
      templateKey: t.template_key,
      name: t.name,
      description: t.description,
      subject: t.subject,
      htmlContent: t.html_content,
      textContent: t.text_content,
      availableVariables: t.available_variables,
      variableDescriptions: t.variable_descriptions,
      previewData: t.preview_data,
      isActive: t.is_active,
      version: t.version,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      lastSentAt: t.last_sent_at,
    }));

    return NextResponse.json({ templates: transformedTemplates });
  } catch (error) {
    console.error('[GET /api/admin/email-templates]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
