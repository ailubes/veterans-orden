import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

export default function CopyrightPage() {
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
        <PageHeader label="ПРАВОВА ІНФОРМАЦІЯ" title="ПОЛІТИКА АВТОРСЬКИХ ПРАВ" />

        <article
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                1. Авторські права
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Всі матеріали, розміщені на веб-сайті freepeople.org.ua, включаючи тексти, графіку,
                логотипи, зображення, аудіо- та відеоматеріали, є власністю ГО «Мережа Вільних Людей»
                або використовуються на законних підставах та захищені законодавством України
                про авторське право.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                2. Дозволене використання
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Ви можете:
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Переглядати матеріали сайту для особистого некомерційного використання</li>
                <li>Цитувати невеликі фрагменти з обов&apos;язковим посиланням на джерело</li>
                <li>Ділитися посиланнями на матеріали сайту в соціальних мережах</li>
                <li>Використовувати матеріали для освітніх цілей з посиланням на джерело</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                3. Заборонене використання
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Без письмового дозволу Мережі забороняється:
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Копіювати та поширювати матеріали в комерційних цілях</li>
                <li>Модифікувати, адаптувати або створювати похідні роботи</li>
                <li>Видаляти знаки авторського права з матеріалів</li>
                <li>Використовувати логотип Мережі без дозволу</li>
                <li>Автоматично збирати контент за допомогою ботів або скриптів</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                4. Товарні знаки
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Назва «Мережа Вільних Людей», логотип та інші знаки є товарними знаками організації.
                Використання цих знаків без письмового дозволу забороняється.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                5. Контент користувачів
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Публікуючи контент на нашій платформі, ви надаєте Мережі невиключну ліцензію на
                використання, відтворення та поширення цього контенту в рамках діяльності організації.
                При цьому ви зберігаєте авторські права на свій контент.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                6. Повідомлення про порушення
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Якщо ви вважаєте, що ваші авторські права були порушені на нашому сайті,
                будь ласка, зв&apos;яжіться з нами за адресою{' '}
                <a href="mailto:info@freepeople.org.ua" style={{ color: 'var(--accent)' }}>
                  info@freepeople.org.ua
                </a>
                {' '}з детальним описом порушення.
              </p>
            </section>

            <section>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                7. Запит на використання
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Для отримання дозволу на використання матеріалів сайту в цілях, не передбачених
                цією Політикою, надішліть запит на{' '}
                <a href="mailto:info@freepeople.org.ua" style={{ color: 'var(--accent)' }}>
                  info@freepeople.org.ua
                </a>
              </p>
            </section>

            <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '40px' }}>
              © {new Date().getFullYear()} ГО «Мережа Вільних Людей». Всі права захищені.
            </p>
          </div>
        </article>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
