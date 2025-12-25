/**
 * Audit Logging System
 *
 * Logs all administrative actions to the audit_log table for compliance,
 * security monitoring, and accountability.
 *
 * Usage:
 *   await createAuditLog({
 *     userId: admin.id,
 *     action: 'update_member_role',
 *     entityType: 'user',
 *     entityId: member.id,
 *     oldData: { role: 'full_member' },
 *     newData: { role: 'regional_leader' },
 *     ipAddress: request.headers.get('x-forwarded-for'),
 *     userAgent: request.headers.get('user-agent'),
 *   });
 */

import { createClient } from '@/lib/supabase/server';

export interface AuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry
 *
 * @param entry - The audit log entry data
 * @returns Promise that resolves when the log entry is created
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('audit_log')
      .insert({
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        old_data: entry.oldData || null,
        new_data: entry.newData || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        metadata: entry.metadata || null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Log error but don't throw - we don't want audit logging failures
      // to break the main operation
      console.error('[Audit Log Error]', error);
    }
  } catch (err) {
    // Silently fail - audit logging is important but not critical
    console.error('[Audit Log Exception]', err);
  }
}

/**
 * Common audit actions
 * Use these constants for consistency across the application
 */
export const AUDIT_ACTIONS = {
  // Member management
  CREATE_MEMBER: 'create_member',
  UPDATE_MEMBER: 'update_member',
  DELETE_MEMBER: 'delete_member',
  UPDATE_MEMBER_ROLE: 'update_member_role',
  SUSPEND_MEMBER: 'suspend_member',
  UNSUSPEND_MEMBER: 'unsuspend_member',
  VERIFY_MEMBER: 'verify_member',
  ADJUST_POINTS: 'adjust_points',

  // Impersonation
  IMPERSONATE_START: 'impersonate_start',
  IMPERSONATE_END: 'impersonate_end',

  // Events
  CREATE_EVENT: 'create_event',
  UPDATE_EVENT: 'update_event',
  DELETE_EVENT: 'delete_event',
  CANCEL_EVENT: 'cancel_event',

  // Votes
  CREATE_VOTE: 'create_vote',
  UPDATE_VOTE: 'update_vote',
  DELETE_VOTE: 'delete_vote',
  CLOSE_VOTE: 'close_vote',

  // Tasks
  CREATE_TASK: 'create_task',
  UPDATE_TASK: 'update_task',
  DELETE_TASK: 'delete_task',

  // News
  CREATE_NEWS: 'create_news',
  UPDATE_NEWS: 'update_news',
  DELETE_NEWS: 'delete_news',
  PUBLISH_NEWS: 'publish_news',

  // Settings
  UPDATE_ORGANIZATION: 'update_organization',
  UPDATE_SYSTEM_CONFIG: 'update_system_config',
  ASSIGN_ROLE: 'assign_role',

  // Notifications
  SEND_NOTIFICATION: 'send_notification',
  SEND_BULK_NOTIFICATION: 'send_bulk_notification',
} as const;

/**
 * Entity types for audit logs
 */
export const AUDIT_ENTITY_TYPES = {
  USER: 'user',
  EVENT: 'event',
  VOTE: 'vote',
  TASK: 'task',
  NEWS: 'news',
  ORGANIZATION: 'organization',
  SYSTEM: 'system',
  NOTIFICATION: 'notification',
} as const;

/**
 * Helper to create a diff between old and new data
 * Useful for showing what changed in the audit log viewer
 */
export function createDataDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): { field: string; old: unknown; new: unknown }[] {
  const diff: { field: string; old: unknown; new: unknown }[] = [];

  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));

  for (const key of allKeys) {
    if (oldData[key] !== newData[key]) {
      diff.push({
        field: key,
        old: oldData[key],
        new: newData[key],
      });
    }
  }

  return diff;
}

/**
 * Get audit logs with filters
 * Used by the audit log viewer in admin settings
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('audit_log')
    .select('*, user:users(first_name, last_name, email)')
    .order('created_at', { ascending: false });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.action) {
    query = query.eq('action', filters.action);
  }

  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }

  if (filters.entityId) {
    query = query.eq('entity_id', filters.entityId);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
