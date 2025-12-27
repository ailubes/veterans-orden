-- Migration: Add email templates management system
-- Date: 2025-12-27
-- Description: Allows admins to customize email templates with variable substitution

BEGIN;

-- Create email send status enum
DO $$ BEGIN
  CREATE TYPE email_send_status AS ENUM (
    'pending',
    'sent',
    'failed',
    'bounced'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template identification
  template_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Email content
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,

  -- Template variables documentation
  available_variables JSONB DEFAULT '[]',
  variable_descriptions JSONB DEFAULT '{}',
  preview_data JSONB DEFAULT '{}',

  -- Status & metadata
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,

  -- Audit
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by_id UUID REFERENCES users(id),
  updated_by_id UUID REFERENCES users(id),
  last_sent_at TIMESTAMP
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_key_idx ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS email_templates_active_idx ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS email_templates_updated_at_idx ON email_templates(updated_at);

-- Create email template history table
CREATE TABLE IF NOT EXISTS email_template_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE NOT NULL,

  -- Snapshot
  version INTEGER NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,

  -- Metadata
  changed_by_id UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  change_reason TEXT
);

CREATE INDEX IF NOT EXISTS email_template_history_template_idx ON email_template_history(template_id);
CREATE INDEX IF NOT EXISTS email_template_history_version_idx ON email_template_history(template_id, version);

-- Create email send log table
CREATE TABLE IF NOT EXISTS email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  template_key VARCHAR(100) NOT NULL,
  template_version INTEGER,

  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID REFERENCES users(id),

  subject VARCHAR(255) NOT NULL,
  variables_used JSONB,

  status email_send_status DEFAULT 'pending' NOT NULL,
  provider_message_id VARCHAR(255),
  error_message TEXT,

  sent_at TIMESTAMP DEFAULT NOW() NOT NULL,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS email_send_log_template_idx ON email_send_log(template_key);
CREATE INDEX IF NOT EXISTS email_send_log_recipient_idx ON email_send_log(recipient_email);
CREATE INDEX IF NOT EXISTS email_send_log_user_idx ON email_send_log(recipient_user_id);
CREATE INDEX IF NOT EXISTS email_send_log_sent_at_idx ON email_send_log(sent_at);
CREATE INDEX IF NOT EXISTS email_send_log_status_idx ON email_send_log(status);

-- Seed initial templates from hardcoded email.ts
INSERT INTO email_templates (template_key, name, description, subject, html_content, text_content, available_variables, variable_descriptions, preview_data, is_active) VALUES
  (
    'welcome',
    'Welcome Email',
    'Sent to new members when they join the network',
    '🎉 Ласкаво просимо до Мережі Вільних Людей!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A1A1A; color: #F5F0E8; padding: 30px; text-align: center; }
    .content { background: #FFFFFF; padding: 30px; }
    .footer { background: #F5F0E8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #D4A574; color: #F5F0E8; text-decoration: none; font-weight: bold; margin: 20px 0; }
    h1 { font-family: ''Syne'', sans-serif; margin: 0; font-size: 28px; }
    .accent { color: #D4A574; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ласкаво просимо до Мережі!</h1>
    </div>
    <div class="content">
      <p>Привіт, <strong>{{firstName}} {{lastName}}</strong>!</p>
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
</html>',
    'Привіт, {{firstName}} {{lastName}}!

Вітаємо вас у Мережі Вільних Людей — спільноті, яка гуртується для справжніх змін в Україні.

Що далі?
- Заповніть свій профіль
- Підключіться до регіональної групи
- Приєднуйтесь до подій та голосувань
- Запрошуйте однодумців

Перейти до платформи: https://freepeople.org.ua/dashboard

ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!',
    '["firstName", "lastName"]'::jsonb,
    '{"firstName": "User''s first name", "lastName": "User''s last name"}'::jsonb,
    '{"firstName": "Іван", "lastName": "Петренко"}'::jsonb,
    true
  ),
  (
    'event_reminder',
    'Event Reminder',
    'Sent to remind users about upcoming events they registered for',
    '📅 Нагадування: {{eventTitle}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
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
      <p>Привіт, <strong>{{firstName}}</strong>!</p>
      <p>Нагадуємо, що скоро відбудеться подія, на яку ви зареєструвалися:</p>
      <div class="event-card">
        <h2 style="margin-top: 0;">{{eventTitle}}</h2>
        <p><strong>Дата:</strong> {{eventDate}}</p>
      </div>
      <p style="text-align: center;">
        <a href="{{eventUrl}}" class="button">ДЕТАЛІ ПОДІЇ →</a>
      </p>
      <p>До зустрічі на події!</p>
    </div>
    <div class="footer">
      <p>Мережа Вільних Людей</p>
    </div>
  </div>
</body>
</html>',
    'Привіт, {{firstName}}!

Нагадуємо, що скоро відбудеться подія: {{eventTitle}}

Дата: {{eventDate}}

Деталі: {{eventUrl}}

До зустрічі на події!',
    '["firstName", "eventTitle", "eventDate", "eventUrl"]'::jsonb,
    '{"firstName": "User''s first name", "eventTitle": "Event title", "eventDate": "Event date and time", "eventUrl": "Link to event details"}'::jsonb,
    '{"firstName": "Марія", "eventTitle": "Зустріч активістів у Києві", "eventDate": "28 грудня 2025, 18:00", "eventUrl": "https://freepeople.org.ua/events/123"}'::jsonb,
    true
  ),
  (
    'vote_reminder',
    'Vote Reminder',
    'Sent to remind users to participate in active votes',
    '🗳️ Нагадування: {{voteTitle}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
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
      <p>Привіт, <strong>{{firstName}}</strong>!</p>
      <p class="urgent">⏰ Не пропустіть можливість проголосувати!</p>
      <div class="vote-card">
        <h2 style="margin-top: 0;">{{voteTitle}}</h2>
        <p><strong>Дедлайн:</strong> {{voteDeadline}}</p>
      </div>
      <p>Ваша думка формує майбутнє Мережі. Долучайтесь до прийняття важливих рішень!</p>
      <p style="text-align: center;">
        <a href="{{voteUrl}}" class="button">ПРОГОЛОСУВАТИ →</a>
      </p>
    </div>
    <div class="footer">
      <p>Мережа Вільних Людей</p>
    </div>
  </div>
</body>
</html>',
    'Привіт, {{firstName}}!

⏰ Не пропустіть можливість проголосувати!

{{voteTitle}}

Дедлайн: {{voteDeadline}}

Ваша думка формує майбутнє Мережі.

Проголосувати: {{voteUrl}}',
    '["firstName", "voteTitle", "voteDeadline", "voteUrl"]'::jsonb,
    '{"firstName": "User''s first name", "voteTitle": "Vote title", "voteDeadline": "Voting deadline", "voteUrl": "Link to vote"}'::jsonb,
    '{"firstName": "Олексій", "voteTitle": "Затвердження нової стратегії", "voteDeadline": "31 грудня 2025, 23:59", "voteUrl": "https://freepeople.org.ua/votes/456"}'::jsonb,
    true
  ),
  (
    'admin_notification',
    'Admin Notification',
    'Generic notification template for admins',
    '[ADMIN] {{subject}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
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
        {{message}}
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
</html>',
    '{{message}}',
    '["subject", "message"]'::jsonb,
    '{"subject": "Alert subject", "message": "Alert message content"}'::jsonb,
    '{"subject": "Нова реєстрація", "message": "Новий користувач зареєструвався на платформі"}'::jsonb,
    true
  ),
  (
    'order_confirmation',
    'Order Confirmation',
    'Sent when user completes an order in the marketplace',
    '✅ Замовлення #{{orderNumber}} підтверджено',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A1A1A; color: #F5F0E8; padding: 30px; text-align: center; }
    .content { background: #FFFFFF; padding: 30px; }
    .footer { background: #F5F0E8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #D4A574; color: #F5F0E8; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .order-summary { background: #F5F0E8; padding: 20px; margin: 20px 0; }
    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .order-table th { background: #1A1A1A; color: #F5F0E8; padding: 10px; text-align: left; }
    .order-table td { padding: 10px; border-bottom: 1px solid #E0E0E0; }
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
      <p>Привіт, <strong>{{firstName}}</strong>!</p>
      <p>Дякуємо за ваше замовлення! Ми отримали його та вже працюємо над обробкою.</p>
      <div class="order-summary">
        <p><strong>Номер замовлення:</strong> <span class="accent">#{{orderNumber}}</span></p>
      </div>
      <h3>Деталі замовлення:</h3>
      {{orderItemsTable}}
      <div class="total">
        <p>Всього: <span class="accent">{{totalPoints}} балів</span></p>
      </div>
      <h3 class="accent">Що далі?</h3>
      <ul>
        <li>Ми опрацюємо ваше замовлення протягом 1-2 робочих днів</li>
        <li>Ви отримаєте повідомлення про статус замовлення</li>
        <li>Відстежити замовлення можна в особистому кабінеті</li>
      </ul>
      <p style="text-align: center;">
        <a href="{{orderUrl}}" class="button">ПЕРЕГЛЯНУТИ ЗАМОВЛЕННЯ →</a>
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
</html>',
    'Привіт, {{firstName}}!

Дякуємо за ваше замовлення!

Номер замовлення: #{{orderNumber}}

{{orderItemsList}}

Всього: {{totalPoints}} балів

Що далі?
- Ми опрацюємо ваше замовлення протягом 1-2 робочих днів
- Ви отримаєте повідомлення про статус замовлення
- Відстежити замовлення: {{orderUrl}}

Дякуємо за довіру!

Мережа Вільних Людей',
    '["firstName", "orderNumber", "orderItemsTable", "orderItemsList", "totalPoints", "orderUrl"]'::jsonb,
    '{"firstName": "User''s first name", "orderNumber": "Order number", "orderItemsTable": "HTML table of order items", "orderItemsList": "Text list of order items", "totalPoints": "Total points", "orderUrl": "Link to order details"}'::jsonb,
    '{"firstName": "Світлана", "orderNumber": "12345ABC", "orderItemsTable": "<table class=\"order-table\"><tr><td>T-Shirt</td><td>1</td><td>100 балів</td></tr></table>", "orderItemsList": "T-Shirt x1 - 100 балів", "totalPoints": "100", "orderUrl": "https://freepeople.org.ua/orders/789"}'::jsonb,
    true
  )
ON CONFLICT (template_key) DO NOTHING;

-- Add comments
COMMENT ON TABLE email_templates IS 'Customizable email templates for system notifications';
COMMENT ON TABLE email_template_history IS 'Version history of email template changes';
COMMENT ON TABLE email_send_log IS 'Log of all emails sent through the system';

COMMIT;
