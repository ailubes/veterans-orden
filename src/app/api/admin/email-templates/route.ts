import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/get-user';
import { getAllEmailTemplates } from '@/lib/email-templates';

/**
 * GET /api/admin/email-templates
 * Get all email templates
 */
export async function GET(request: NextRequest) {
  const { isAdmin, error } = await requireAdminUser(request);
  if (!isAdmin) {
    return NextResponse.json({ error: error || 'Forbidden' }, { status: 403 });
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
    if (error instanceof Response) {
      return error;
    }
    console.error('[GET /api/admin/email-templates]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
