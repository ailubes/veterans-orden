import { Resend } from 'resend';

const FROM_EMAIL = 'Мережа Вільних Людей <noreply@freepeople.org.ua>';

let resendInstance: Resend | null = null;

function getResendInstance() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const resend = getResendInstance();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[Email] Sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('[Email] Error:', error);
    throw error;
  }
}

/**
 * Welcome email for new members
 */
export async function sendWelcomeEmail(
  to: string,
  firstName: string,
  lastName: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A1A1A; color: #F5F0E8; padding: 30px; text-align: center; }
    .content { background: #FFFFFF; padding: 30px; }
    .footer { background: #F5F0E8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #D4A574; color: #F5F0E8; text-decoration: none; font-weight: bold; margin: 20px 0; }
    h1 { font-family: 'Syne', sans-serif; margin: 0; font-size: 28px; }
    .accent { color: #D4A574; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ласкаво просимо до Мережі!</h1>
    </div>
    <div class="content">
      <p>Привіт, <strong>${firstName} ${lastName}</strong>!</p>

      <p>Вітаємо вас у <strong>Мережі Вільних Людей</strong> — спільноті, яка гуртується для справжніх змін в Україні.</p>

      <p>Тепер ви частина руху, де кожен голос має значення, кожна дія веде до результату.</p>

      <h3 class="accent">Що далі?</h3>
      <ul>
        <li>Заповніть свій профіль</li>
        <li>Підключіться до регіональної групи</li>
        <li>Приєднуйтесь до подій та голосувань</li>
        <li>Запрошуйте однодумців</li>
      </ul>

      <p style="text-align: center;">
        <a href="https://freepeople.org.ua/dashboard" class="button">ПЕРЕЙТИ ДО ПЛАТФОРМИ →</a>
      </p>

      <p><strong>ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!</strong></p>
    </div>
    <div class="footer">
      <p>Мережа Вільних Людей</p>
      <p>Ця адреса використовується тільки для інформаційних повідомлень.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Привіт, ${firstName} ${lastName}!

Вітаємо вас у Мережі Вільних Людей — спільноті, яка гуртується для справжніх змін в Україні.

Що далі?
- Заповніть свій профіль
- Підключіться до регіональної групи
- Приєднуйтесь до подій та голосувань
- Запрошуйте однодумців

Перейти до платформи: https://freepeople.org.ua/dashboard

ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!
  `;

  return sendEmail({
    to,
    subject: '🎉 Ласкаво просимо до Мережі Вільних Людей!',
    html,
    text,
  });
}

/**
 * Event reminder email
 */
export async function sendEventReminderEmail(
  to: string,
  firstName: string,
  eventTitle: string,
  eventDate: string,
  eventUrl: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A1A1A; color: #F5F0E8; padding: 30px; text-align: center; }
    .content { background: #FFFFFF; padding: 30px; }
    .footer { background: #F5F0E8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #D4A574; color: #F5F0E8; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .event-card { background: #F5F0E8; padding: 20px; border-left: 4px solid #D4A574; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Нагадування про подію</h1>
    </div>
    <div class="content">
      <p>Привіт, <strong>${firstName}</strong>!</p>

      <p>Нагадуємо, що скоро відбудеться подія, на яку ви зареєструвалися:</p>

      <div class="event-card">
        <h2 style="margin-top: 0;">${eventTitle}</h2>
        <p><strong>Дата:</strong> ${eventDate}</p>
      </div>

      <p style="text-align: center;">
        <a href="${eventUrl}" class="button">ДЕТАЛІ ПОДІЇ →</a>
      </p>

      <p>До зустрічі на події!</p>
    </div>
    <div class="footer">
      <p>Мережа Вільних Людей</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Привіт, ${firstName}!

Нагадуємо, що скоро відбудеться подія: ${eventTitle}

Дата: ${eventDate}

Деталі: ${eventUrl}

До зустрічі на події!
  `;

  return sendEmail({
    to,
    subject: `📅 Нагадування: ${eventTitle}`,
    html,
    text,
  });
}

/**
 * Vote reminder email
 */
export async function sendVoteReminderEmail(
  to: string,
  firstName: string,
  voteTitle: string,
  voteDeadline: string,
  voteUrl: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A1A1A; color: #F5F0E8; padding: 30px; text-align: center; }
    .content { background: #FFFFFF; padding: 30px; }
    .footer { background: #F5F0E8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #D4A574; color: #F5F0E8; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .vote-card { background: #FFF3E0; padding: 20px; border-left: 4px solid #FF9800; margin: 20px 0; }
    .urgent { color: #FF9800; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🗳️ Ваш голос важливий!</h1>
    </div>
    <div class="content">
      <p>Привіт, <strong>${firstName}</strong>!</p>

      <p class="urgent">⏰ Не пропустіть можливість проголосувати!</p>

      <div class="vote-card">
        <h2 style="margin-top: 0;">${voteTitle}</h2>
        <p><strong>Дедлайн:</strong> ${voteDeadline}</p>
      </div>

      <p>Ваша думка формує майбутнє Мережі. Долучайтесь до прийняття важливих рішень!</p>

      <p style="text-align: center;">
        <a href="${voteUrl}" class="button">ПРОГОЛОСУВАТИ →</a>
      </p>
    </div>
    <div class="footer">
      <p>Мережа Вільних Людей</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Привіт, ${firstName}!

⏰ Не пропустіть можливість проголосувати!

${voteTitle}

Дедлайн: ${voteDeadline}

Ваша думка формує майбутнє Мережі.

Проголосувати: ${voteUrl}
  `;

  return sendEmail({
    to,
    subject: `🗳️ Нагадування: ${voteTitle}`,
    html,
    text,
  });
}

/**
 * Admin notification email
 */
export async function sendAdminNotificationEmail(
  to: string | string[],
  subject: string,
  message: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A1A1A; color: #F5F0E8; padding: 30px; text-align: center; }
    .content { background: #FFFFFF; padding: 30px; }
    .footer { background: #F5F0E8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .alert { background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Повідомлення для адміністратора</h1>
    </div>
    <div class="content">
      <div class="alert">
        ${message}
      </div>

      <p style="text-align: center;">
        <a href="https://freepeople.org.ua/admin" style="display: inline-block; padding: 12px 24px; background: #D4A574; color: #F5F0E8; text-decoration: none; font-weight: bold;">
          ПЕРЕЙТИ В АДМІН-ПАНЕЛЬ →
        </a>
      </p>
    </div>
    <div class="footer">
      <p>Мережа Вільних Людей - Адмін Система</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = message;

  return sendEmail({
    to,
    subject: `[ADMIN] ${subject}`,
    html,
    text,
  });
}
