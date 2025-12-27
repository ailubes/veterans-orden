import { NextRequest, NextResponse } from 'next/server';
import { use } from 'react';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { getEmailTemplate, updateEmailTemplate, getTemplateHistory } from '@/lib/email-templates';

/**
 * GET /api/admin/email-templates/[key]
 * Get single email template with history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = use(params);
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
    const template = await getEmailTemplate(key);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Get history
    const history = await getTemplateHistory(key);

    // Transform to camelCase
    const transformedTemplate = {
      id: template.id,
      templateKey: template.template_key,
      name: template.name,
      description: template.description,
      subject: template.subject,
      htmlContent: template.html_content,
      textContent: template.text_content,
      availableVariables: template.available_variables,
      variableDescriptions: template.variable_descriptions,
      previewData: template.preview_data,
      isActive: template.is_active,
      version: template.version,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      lastSentAt: template.last_sent_at,
      history: history.map((h: any) => ({
        id: h.id,
        version: h.version,
        subject: h.subject,
        htmlContent: h.html_content,
        textContent: h.text_content,
        changedAt: h.changed_at,
        changeReason: h.change_reason,
        changedBy: h.changed_by,
      })),
    };

    return NextResponse.json({ template: transformedTemplate });
  } catch (error) {
    console.error(`[GET /api/admin/email-templates/${key}]`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/email-templates/[key]
 * Update email template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = use(params);
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
    const body = await request.json();
    const { subject, htmlContent, textContent, isActive, changeReason } = body;

    // Build updates object (only include provided fields)
    const updates: any = {};
    if (subject !== undefined) updates.subject = subject;
    if (htmlContent !== undefined) updates.htmlContent = htmlContent;
    if (textContent !== undefined) updates.textContent = textContent;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedTemplate = await updateEmailTemplate(
      key,
      updates,
      profile.id,
      changeReason
    );

    // Transform to camelCase
    const transformedTemplate = {
      id: updatedTemplate.id,
      templateKey: updatedTemplate.template_key,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      subject: updatedTemplate.subject,
      htmlContent: updatedTemplate.html_content,
      textContent: updatedTemplate.text_content,
      availableVariables: updatedTemplate.available_variables,
      variableDescriptions: updatedTemplate.variable_descriptions,
      previewData: updatedTemplate.preview_data,
      isActive: updatedTemplate.is_active,
      version: updatedTemplate.version,
      createdAt: updatedTemplate.created_at,
      updatedAt: updatedTemplate.updated_at,
      lastSentAt: updatedTemplate.last_sent_at,
    };

    return NextResponse.json({ template: transformedTemplate });
  } catch (error) {
    console.error(`[PATCH /api/admin/email-templates/${key}]`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
