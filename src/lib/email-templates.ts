import { createClient } from '@/lib/supabase/server';

/**
 * Template variable substitution
 * Replaces {{variable}} placeholders with actual values
 */
export function substituteVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

/**
 * Get template from database
 */
export async function getEmailTemplate(templateKey: string) {
  try {
    const supabase = await createClient();

    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', templateKey)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`[Email Template] Error fetching ${templateKey}:`, error);
      return null;
    }

    return template;
  } catch (error) {
    console.error(`[Email Template] Error fetching ${templateKey}:`, error);
    return null;
  }
}

/**
 * Get all email templates (admin)
 */
export async function getAllEmailTemplates() {
  try {
    const supabase = await createClient();

    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('template_key', { ascending: true });

    if (error) {
      console.error('[Email Template] Error fetching all templates:', error);
      return [];
    }

    return templates || [];
  } catch (error) {
    console.error('[Email Template] Error fetching all templates:', error);
    return [];
  }
}

/**
 * Update email template
 */
export async function updateEmailTemplate(
  templateKey: string,
  updates: {
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    isActive?: boolean;
  },
  updatedById: string,
  changeReason?: string
) {
  try {
    const supabase = await createClient();

    // Get current template to save history
    const { data: currentTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', templateKey)
      .single();

    if (!currentTemplate) {
      throw new Error(`Template ${templateKey} not found`);
    }

    // Update template
    const newVersion = currentTemplate.version + 1;
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('email_templates')
      .update({
        ...updates,
        version: newVersion,
        updated_at: new Date().toISOString(),
        updated_by_id: updatedById,
      })
      .eq('template_key', templateKey)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Save to history
    await supabase.from('email_template_history').insert({
      template_id: currentTemplate.id,
      version: newVersion,
      subject: updates.subject || currentTemplate.subject,
      html_content: updates.htmlContent || currentTemplate.html_content,
      text_content: updates.textContent || currentTemplate.text_content,
      changed_by_id: updatedById,
      change_reason: changeReason,
    });

    return updatedTemplate;
  } catch (error) {
    console.error(`[Email Template] Error updating ${templateKey}:`, error);
    throw error;
  }
}

/**
 * Get template history
 */
export async function getTemplateHistory(templateKey: string) {
  try {
    const supabase = await createClient();

    // Get template ID first
    const { data: template } = await supabase
      .from('email_templates')
      .select('id')
      .eq('template_key', templateKey)
      .single();

    if (!template) {
      return [];
    }

    const { data: history, error } = await supabase
      .from('email_template_history')
      .select(`
        *,
        changed_by:users!changed_by_id(first_name, last_name)
      `)
      .eq('template_id', template.id)
      .order('version', { ascending: false });

    if (error) {
      console.error('[Email Template] Error fetching history:', error);
      return [];
    }

    return history || [];
  } catch (error) {
    console.error('[Email Template] Error fetching history:', error);
    return [];
  }
}

/**
 * Log email send event
 */
export async function logEmailSend(data: {
  templateKey: string;
  templateVersion: number | null;
  recipientEmail: string;
  recipientUserId?: string;
  subject: string;
  variablesUsed: Record<string, unknown>;
  status?: 'pending' | 'sent' | 'failed' | 'bounced';
  providerMessageId?: string;
  errorMessage?: string;
}) {
  try {
    const supabase = await createClient();

    await supabase.from('email_send_log').insert({
      template_key: data.templateKey,
      template_version: data.templateVersion,
      recipient_email: data.recipientEmail,
      recipient_user_id: data.recipientUserId,
      subject: data.subject,
      variables_used: data.variablesUsed,
      status: data.status || 'pending',
      provider_message_id: data.providerMessageId,
      error_message: data.errorMessage,
    });
  } catch (error) {
    console.error('[Email Template] Error logging send:', error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  availableVariables: string[],
  providedVariables: Record<string, unknown>
): { valid: boolean; missing: string[] } {
  const missing = availableVariables.filter(
    (varName) => !(varName in providedVariables)
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get email send statistics
 */
export async function getEmailStatistics(templateKey?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('email_send_log')
      .select('status, template_key, sent_at');

    if (templateKey) {
      query = query.eq('template_key', templateKey);
    }

    const { data, error } = await query.order('sent_at', { ascending: false }).limit(1000);

    if (error) {
      console.error('[Email Template] Error fetching statistics:', error);
      return { total: 0, sent: 0, failed: 0, pending: 0, bounced: 0 };
    }

    const stats = {
      total: data?.length || 0,
      sent: data?.filter((l) => l.status === 'sent').length || 0,
      failed: data?.filter((l) => l.status === 'failed').length || 0,
      pending: data?.filter((l) => l.status === 'pending').length || 0,
      bounced: data?.filter((l) => l.status === 'bounced').length || 0,
    };

    return stats;
  } catch (error) {
    console.error('[Email Template] Error fetching statistics:', error);
    return { total: 0, sent: 0, failed: 0, pending: 0, bounced: 0 };
  }
}
