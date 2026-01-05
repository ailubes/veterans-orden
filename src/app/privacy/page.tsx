import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

export default function PrivacyPage() {
  return (
    <div
      style={{
        backgroundColor: 'var(--canvas)',
        color: 'var(--panel-850)',
        fontFamily: "'Space Mono', monospace",
        minHeight: '100vh',
      }}
    >
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader label="ПРАВОВА ІНФОРМАЦІЯ" title="ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ" />

        <article
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                1. Вступ
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                ГО «Мережа Вільних Людей» (далі — Мережа) поважає вашу конфіденційність та зобов&apos;язується
                захищати ваші персональні дані. Ця Політика пояснює, як ми збираємо, використовуємо
                та захищаємо вашу інформацію.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                2. Які дані ми збираємо
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Ми можемо збирати такі категорії персональних даних:
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Ідентифікаційні дані: ім&apos;я, прізвище, дата народження</li>
                <li>Контактні дані: електронна пошта, номер телефону</li>
                <li>Дані облікового запису: логін, пароль (у зашифрованому вигляді)</li>
                <li>Технічні дані: IP-адреса, тип браузера, дані про пристрій</li>
                <li>Дані про участь: історія голосувань, активність на платформі</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                3. Як ми використовуємо дані
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Ваші персональні дані використовуються для:
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Надання доступу до функцій платформи</li>
                <li>Проведення голосувань та підрахунку результатів</li>
                <li>Комунікації з вами щодо діяльності Мережі</li>
                <li>Покращення роботи сайту та сервісів</li>
                <li>Виконання вимог законодавства</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                4. Захист даних
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Ми застосовуємо технічні та організаційні заходи для захисту ваших даних:
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Шифрування даних при передачі (SSL/TLS)</li>
                <li>Зберігання паролів у зашифрованому вигляді</li>
                <li>Обмеження доступу до персональних даних</li>
                <li>Регулярні аудити безпеки</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                5. Передача даних третім особам
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Ми не продаємо та не передаємо ваші персональні дані третім особам без вашої згоди,
                за винятком випадків, передбачених законодавством України.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                6. Ваші права
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Ви маєте право:
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Отримати інформацію про ваші дані, які ми зберігаємо</li>
                <li>Вимагати виправлення неточних даних</li>
                <li>Вимагати видалення ваших даних</li>
                <li>Відкликати згоду на обробку даних</li>
                <li>Подати скаргу до уповноваженого органу</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                7. Файли cookie
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Ми використовуємо файли cookie для забезпечення роботи сайту та покращення
                користувацького досвіду. Ви можете налаштувати свій браузер для блокування cookie,
                але це може вплинути на функціональність сайту.
              </p>
            </section>

            <section>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                8. Контакти
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                З питань щодо конфіденційності звертайтесь:{' '}
                <a href="mailto:info@freepeople.org.ua" style={{ color: 'var(--accent)' }}>
                  info@freepeople.org.ua
                </a>
              </p>
            </section>

            <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '40px' }}>
              Останнє оновлення: грудень 2024
            </p>
          </div>
        </article>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
