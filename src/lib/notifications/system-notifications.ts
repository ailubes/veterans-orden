import { createClient } from '@/lib/supabase/server';

export type SystemNotificationType = 'event' | 'task' | 'news';
export type NotificationScope = 'all' | 'oblast' | 'assignees';

interface SystemNotificationParams {
  type: SystemNotificationType;
  entityId: string;
  title: string;
  message: string;
  scope: NotificationScope;
  oblastId?: string;
  assigneeIds?: string[];
  senderId: string;
  senderName?: string;
}

interface SystemNotificationResult {
  success: boolean;
  notificationId?: string;
  recipientCount?: number;
  error?: string;
}

/**
 * Create a system notification for events, tasks, or news
 * This is called automatically when content is created with notify option enabled
 */
export async function createSystemNotification(
  params: SystemNotificationParams
): Promise<SystemNotificationResult> {
  try {
    const supabase = await createClient();

    const {
      type,
      entityId,
      title,
      message,
      scope,
      oblastId,
      assigneeIds,
      senderId,
      senderName,
    } = params;

    // Determine recipients based on scope
    let recipientQuery = supabase.from('users').select('id').eq('status', 'active');

    switch (scope) {
      case 'all':
        // All active users - no additional filter
        break;

      case 'oblast':
        if (!oblastId) {
          return { success: false, error: 'Oblast ID required for oblast scope' };
        }
        recipientQuery = recipientQuery.eq('oblast_id', oblastId);
        break;

      case 'assignees':
        if (!assigneeIds || assigneeIds.length === 0) {
          return { success: false, error: 'Assignee IDs required for assignees scope' };
        }
        recipientQuery = recipientQuery.in('id', assigneeIds);
        break;

      default:
        return { success: false, error: `Invalid scope: ${scope}` };
    }

    // Get recipient list
    const { data: recipients, error: recipientError } = await recipientQuery;

    if (recipientError) {
      console.error('[System Notification] Error fetching recipients:', recipientError);
      return { success: false, error: 'Failed to fetch recipients' };
    }

    if (!recipients || recipients.length === 0) {
      return { success: true, notificationId: undefined, recipientCount: 0 };
    }

    // Determine notification type label
    const typeLabel = {
      event: 'info',
      task: 'info',
      news: 'info',
    }[type];

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        sender_id: senderId,
        title,
        message,
        type: typeLabel,
        scope,
        scope_value: scope === 'oblast' ? oblastId : null,
        message_type: 'admin_to_member',
        source_entity_type: type,
        source_entity_id: entityId,
        recipient_count: recipients.length,
        metadata: {
          auto_generated: true,
          source_type: type,
          sent_by_name: senderName || 'System',
        },
      })
      .select()
      .single();

    if (notificationError || !notification) {
      console.error('[System Notification] Error creating notification:', notificationError);
      return { success: false, error: 'Failed to create notification' };
    }

    // Create recipient records
    const recipientRecords = recipients.map((recipient) => ({
      notification_id: notification.id,
      user_id: recipient.id,
    }));

    const { error: recipientInsertError } = await supabase
      .from('notification_recipients')
      .insert(recipientRecords);

    if (recipientInsertError) {
      console.error('[System Notification] Error creating recipient records:', recipientInsertError);
      // Don't fail the whole operation, notification was created
    }

    return {
      success: true,
      notificationId: notification.id,
      recipientCount: recipients.length,
    };
  } catch (error) {
    console.error('[System Notification] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper to create event notification
 */
export async function notifyAboutEvent(params: {
  eventId: string;
  title: string;
  description: string;
  scope: 'all' | 'oblast';
  oblastId?: string;
  senderId: string;
  senderName?: string;
}): Promise<SystemNotificationResult> {
  return createSystemNotification({
    type: 'event',
    entityId: params.eventId,
    title: `Нова подія: ${params.title}`,
    message: params.description.slice(0, 200) + (params.description.length > 200 ? '...' : ''),
    scope: params.scope,
    oblastId: params.oblastId,
    senderId: params.senderId,
    senderName: params.senderName,
  });
}

/**
 * Helper to create news notification
 */
export async function notifyAboutNews(params: {
  newsId: string;
  title: string;
  excerpt: string;
  senderId: string;
  senderName?: string;
}): Promise<SystemNotificationResult> {
  return createSystemNotification({
    type: 'news',
    entityId: params.newsId,
    title: `Новина: ${params.title}`,
    message: params.excerpt.slice(0, 200) + (params.excerpt.length > 200 ? '...' : ''),
    scope: 'all',
    senderId: params.senderId,
    senderName: params.senderName,
  });
}

/**
 * Helper to create task notification
 */
export async function notifyAboutTask(params: {
  taskId: string;
  title: string;
  description: string;
  scope: 'all' | 'assignees';
  assigneeIds?: string[];
  senderId: string;
  senderName?: string;
}): Promise<SystemNotificationResult> {
  return createSystemNotification({
    type: 'task',
    entityId: params.taskId,
    title: `Нове завдання: ${params.title}`,
    message: params.description.slice(0, 200) + (params.description.length > 200 ? '...' : ''),
    scope: params.scope,
    assigneeIds: params.assigneeIds,
    senderId: params.senderId,
    senderName: params.senderName,
  });
}
