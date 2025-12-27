import { NextRequest, NextResponse } from 'next/server';
import { use } from 'react';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { getEmailTemplate, substituteVariables } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/admin/email-templates/[key]/test
 * Send a test email using template
 */
export async function POST(
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
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email address is required' }, { status: 400 });
    }

    // Get template
    const template = await getEmailTemplate(key);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Use preview data for test
    const previewData = template.preview_data as Record<string, string>;

    // Substitute variables
    const subject = substituteVariables(template.subject, previewData);
    const html = substituteVariables(template.html_content, previewData);
    const text = template.text_content
      ? substituteVariables(template.text_content, previewData)
      : undefined;

    // Add test indicator to subject
    const testSubject = `[TEST] ${subject}`;

    // Send test email
    await sendEmail({
      to: testEmail,
      subject: testSubject,
      html,
      text,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
    });
  } catch (error) {
    console.error(`[POST /api/admin/email-templates/${key}/test]`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
