import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

export default function TermsPage() {
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
        <PageHeader label="ПРАВОВА ІНФОРМАЦІЯ" title="УМОВИ КОРИСТУВАННЯ" />

        <article
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                1. Загальні положення
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Ці Умови користування регулюють відносини між ГО «Мережа Вільних Людей» (далі — Мережа)
                та користувачами веб-сайту freepeople.org.ua (далі — Сайт).
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Використовуючи Сайт, ви підтверджуєте, що ознайомилися з цими Умовами та погоджуєтесь
                їх дотримуватися.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                2. Членство в Мережі
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Членом Мережі може стати будь-який громадянин України, який досяг 18 років та поділяє
                цінності організації.
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Для реєстрації необхідно надати достовірну інформацію про себе. Надання неправдивих
                даних може бути підставою для припинення членства.
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Членство є добровільним та безкоштовним. Член Мережі може припинити членство
                у будь-який момент.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                3. Права та обов&apos;язки членів
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                <strong>Члени Мережі мають право:</strong>
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px', paddingLeft: '20px' }}>
                <li>Брати участь у голосуваннях з усіх питань діяльності організації</li>
                <li>Висувати пропозиції та ініціативи</li>
                <li>Отримувати інформацію про діяльність Мережі</li>
                <li>Бути обраними до керівних органів</li>
              </ul>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                <strong>Члени Мережі зобов&apos;язані:</strong>
              </p>
              <ul style={{ fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Дотримуватися Статуту та рішень Мережі</li>
                <li>Не завдавати шкоди репутації організації</li>
                <li>Поважати права інших членів</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                4. Використання Сайту
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
                Користувачі зобов&apos;язуються не використовувати Сайт для незаконних цілей, не порушувати
                права інших користувачів, не поширювати шкідливе програмне забезпечення.
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Мережа залишає за собою право обмежити доступ до Сайту у разі порушення цих Умов.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                5. Інтелектуальна власність
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Всі матеріали на Сайті є власністю Мережі або використовуються на законних підставах.
                Використання матеріалів без дозволу забороняється, крім випадків, передбачених законом.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                6. Зміни до Умов
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                Мережа може вносити зміни до цих Умов у будь-який час. Про суттєві зміни користувачі
                будуть повідомлені через Сайт або електронну пошту.
              </p>
            </section>

            <section>
              <h2 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                7. Контактна інформація
              </h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
                З питань щодо цих Умов звертайтесь на електронну пошту:{' '}
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
