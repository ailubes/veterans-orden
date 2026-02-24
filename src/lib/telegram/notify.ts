import { createBotAdminClient, disableTelegramNotifications } from './db';

// Notification type from the DB schema
type NotifType = 'system' | 'vote' | 'event' | 'task' | 'achievement' | 'news' | 'referral';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotifType;
  data?: Record<string, unknown>;
}

const TYPE_EMOJI: Record<NotifType, string> = {
  system: '📢',
  vote: '🗳️',
  event: '📅',
  task: '✅',
  achievement: '🏆',
  news: '📰',
  referral: '👥',
};

function formatMessage(notif: Notification): string {
  const emoji = TYPE_EMOJI[notif.type] || '📢';
  return `${emoji} <b>${notif.title}</b>\n\n${notif.body}`;
}

function buildCtaButton(notif: Notification): { text: string; url: string } | null {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ordenv.org';
  switch (notif.type) {
    case 'vote':
      return { text: '🗳️ Проголосувати', url: `${baseUrl}/dashboard/votes` };
    case 'event':
      return { text: '📅 Переглянути подію', url: `${baseUrl}/dashboard` };
    case 'task':
      return { text: '✅ Перейти до завдань', url: `${baseUrl}/dashboard/tasks` };
    case 'achievement':
      return { text: '🏆 Мої досягнення', url: `${baseUrl}/dashboard/progression` };
    case 'news':
      return { text: '📰 Читати новини', url: `${baseUrl}/news` };
    case 'referral':
      return { text: '👥 Мої реферали', url: `${baseUrl}/dashboard/referrals` };
    default:
      return { text: '🌐 Відкрити сайт', url: baseUrl };
  }
}

async function sendTelegramMessage(
  telegramId: number,
  text: string,
  inlineButton: { text: string; url: string } | null
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');

  const body: Record<string, unknown> = {
    chat_id: telegramId,
    text,
    parse_mode: 'HTML',
  };

  if (inlineButton) {
    body.reply_markup = {
      inline_keyboard: [[{ text: inlineButton.text, url: inlineButton.url }]],
    };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json() as { ok: boolean; result?: { message_id: number }; description?: string; error_code?: number };
  return data;
}

export async function sendTelegramNotification(
  telegramId: number,
  notification: Notification,
  recipientId?: string
) {
  const text = formatMessage(notification);
  const cta = buildCtaButton(notification);

  try {
    const response = await sendTelegramMessage(telegramId, text, cta);

    if (response.ok && recipientId) {
      const supabase = createBotAdminClient();
      await supabase
        .from('notification_recipients')
        .update({
          telegram_message_id: response.result?.message_id,
          telegram_sent_at: new Date().toISOString(),
          telegram_error: null,
        })
        .eq('notification_id', notification.id)
        .eq('user_id', recipientId);
    } else if (!response.ok && recipientId) {
      const supabase = createBotAdminClient();
      await supabase
        .from('notification_recipients')
        .update({
          telegram_error: response.description || 'unknown error',
        })
        .eq('notification_id', notification.id)
        .eq('user_id', recipientId);

      // If bot was blocked by user, disable their notifications
      if (response.error_code === 403) {
        await disableTelegramNotifications(telegramId);
      }
    }

    return response.ok;
  } catch (err) {
    console.error('[TG Notify] sendTelegramNotification error:', err);
    return false;
  }
}

/**
 * Deliver a notification to all recipients who have Telegram linked and enabled.
 * Fire-and-forget: does not await all deliveries.
 */
export async function deliverNotificationToTelegram(
  notificationId: string,
  notification: Notification
) {
  const supabase = createBotAdminClient();

  const { data: recipients } = await supabase
    .from('notification_recipients')
    .select('user_id, users!inner(telegram_id, telegram_notifications_enabled)')
    .eq('notification_id', notificationId);

  if (!recipients?.length) return;

  for (const recipient of recipients) {
    const user = Array.isArray(recipient.users) ? recipient.users[0] : recipient.users as { telegram_id: number | null; telegram_notifications_enabled: boolean | null };
    if (!user?.telegram_id || !user.telegram_notifications_enabled) continue;

    // Fire and forget — don't block the response
    sendTelegramNotification(user.telegram_id, notification, recipient.user_id).catch((err) => {
      console.error('[TG Notify] Delivery error for user:', recipient.user_id, err);
    });
  }
}
