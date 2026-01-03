'use client';

/**
 * TinaCMS Visual Editor Route
 *
 * This page provides the visual editing interface for static pages.
 * Accessible at: /admin/tina
 *
 * NOTE: This is separate from the main admin panel (/admin) which handles
 * database-driven content (news, events, help, products, users).
 *
 * TinaCMS is used ONLY for editing the 19 static informational pages:
 * - About, Mission, Governance, Honor Court, Code of Honor
 * - Directions, Join, Support, Help Request, Documents
 * - Transparency, Commanderies, Media, FAQ
 * - And their subpages
 */

export default function TinaCMSAdminPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '1rem' }}>
        Редактор Статичних Сторінок
      </h1>
      <p style={{ marginBottom: '1rem', fontSize: '18px', lineHeight: 1.6 }}>
        Цей розділ для редагування інформаційних сторінок сайту через TinaCMS.
      </p>

      <div style={{ padding: '1rem', background: '#f5f5f5', border: '1px solid #ccc', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Примітка
        </h2>
        <p style={{ fontSize: '14px', lineHeight: 1.5 }}>
          TinaCMS редактор буде доступний тут після запуску dev сервера з командою: <code>npm run dev</code>
        </p>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Сторінки для редагування:
      </h3>
      <ul style={{ marginLeft: '2rem', listStyle: 'disc', fontSize: '14px', lineHeight: 1.8 }}>
        <li>Про Орден</li>
        <li>Місія та Цінності</li>
        <li>Управління (Тріада)</li>
        <li>Суд Честі</li>
        <li>Кодекс Честі</li>
        <li>Напрями</li>
        <li>Приєднатися</li>
        <li>Підтримати</li>
        <li>Потрібна допомога</li>
        <li>Документи</li>
        <li>Прозорість</li>
        <li>Командерії</li>
        <li>Медіа</li>
        <li>FAQ</li>
        <li>+ підсторінки (Президент, Віце-президент, Колегія Мислителів, etc.)</li>
      </ul>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', border: '1px solid #ffc107' }}>
        <p style={{ fontSize: '14px', fontWeight: 'bold' }}>
          ⚠️ Для редагування динамічного контенту (новини, події, допомога, товари, користувачі) використовуйте основний адмін-панель за адресою: <a href="/admin">/admin</a>
        </p>
      </div>
    </div>
  );
}
