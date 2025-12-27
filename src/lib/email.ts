import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const FROM_EMAIL = process.env.SMTP_FROM || 'Мережа Вільних Людей <info@freepeople.org.ua>';

let transporterInstance: Transporter | null = null;

function getTransporter() {
  if (!transporterInstance) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !port || !user || !pass) {
      throw new Error('SMTP configuration is incomplete. Please check environment variables.');
    }

    transporterInstance = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }
  return transporterInstance;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using SMTP (Nodemailer)
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('[Email] Sent successfully:', info.messageId);
    return { id: info.messageId, success: true };
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

/**
 * Order confirmation email
 */
export interface OrderItem {
  productName: string;
  quantity: number;
  pricePoints: number;
  priceUah: number;
}

export async function sendOrderConfirmationEmail(
  to: string,
  firstName: string,
  orderId: string,
  items: OrderItem[],
  totalPoints: number,
  totalUah: number,
  orderUrl: string
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E0E0E0;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E0E0E0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E0E0E0; text-align: right;">${item.pricePoints} балів${item.priceUah > 0 ? ` / ${(item.priceUah / 100).toFixed(2)} грн` : ''}</td>
    </tr>
  `).join('');

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
    .order-summary { background: #F5F0E8; padding: 20px; margin: 20px 0; }
    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .order-table th { background: #1A1A1A; color: #F5F0E8; padding: 10px; text-align: left; }
    .total { font-size: 18px; font-weight: bold; padding-top: 15px; border-top: 2px solid #1A1A1A; }
    .accent { color: #D4A574; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Замовлення підтверджено!</h1>
    </div>
    <div class="content">
      <p>Привіт, <strong>${firstName}</strong>!</p>

      <p>Дякуємо за ваше замовлення! Ми отримали його та вже працюємо над обробкою.</p>

      <div class="order-summary">
        <p><strong>Номер замовлення:</strong> <span class="accent">#${orderId.slice(0, 8).toUpperCase()}</span></p>
      </div>

      <h3>Деталі замовлення:</h3>
      <table class="order-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th style="text-align: center;">Кількість</th>
            <th style="text-align: right;">Ціна</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total">
        <p>Всього: <span class="accent">${totalPoints} балів${totalUah > 0 ? ` / ${(totalUah / 100).toFixed(2)} грн` : ''}</span></p>
      </div>

      <h3 class="accent">Що далі?</h3>
      <ul>
        <li>Ми опрацюємо ваше замовлення протягом 1-2 робочих днів</li>
        <li>Ви отримаєте повідомлення про статус замовлення</li>
        <li>Відстежити замовлення можна в особистому кабінеті</li>
      </ul>

      <p style="text-align: center;">
        <a href="${orderUrl}" class="button">ПЕРЕГЛЯНУТИ ЗАМОВЛЕННЯ →</a>
      </p>

      <p>Якщо у вас виникли питання, звертайтесь до нашої служби підтримки.</p>

      <p><strong>Дякуємо за довіру!</strong></p>
    </div>
    <div class="footer">
      <p>Мережа Вільних Людей</p>
      <p>Ця адреса використовується тільки для інформаційних повідомлень.</p>
    </div>
  </div>
</body>
</html>
  `;

  const itemsText = items.map(item =>
    `${item.productName} x${item.quantity} - ${item.pricePoints} балів${item.priceUah > 0 ? ` / ${(item.priceUah / 100).toFixed(2)} грн` : ''}`
  ).join('\n');

  const text = `
Привіт, ${firstName}!

Дякуємо за ваше замовлення!

Номер замовлення: #${orderId.slice(0, 8).toUpperCase()}

Деталі замовлення:
${itemsText}

Всього: ${totalPoints} балів${totalUah > 0 ? ` / ${(totalUah / 100).toFixed(2)} грн` : ''}

Що далі?
- Ми опрацюємо ваше замовлення протягом 1-2 робочих днів
- Ви отримаєте повідомлення про статус замовлення
- Відстежити замовлення: ${orderUrl}

Дякуємо за довіру!

Мережа Вільних Людей
  `;

  return sendEmail({
    to,
    subject: `✅ Замовлення #${orderId.slice(0, 8).toUpperCase()} підтверджено`,
    html,
    text,
  });
}
