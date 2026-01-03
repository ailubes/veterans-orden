'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ХТО МИ"
          title="ПРО ОРДЕН"
          description="Громадська структура підтримки, дисципліни та дії для ветеранів та їхніх союзників."
        />

        {/* Main Content */}
        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              ГО «Орден Ветеранів» створена як відповідь на реальність, у якій багато ветеранів стикаються не лише з фізичними наслідками війни, а й із соціальною порожнечею після повернення. Суспільство часто не дає зрозумілих "рельсів": як знайти підтримку, як об'єднатись, як не втратити себе, як не розчинитися в побуті та бюрократії.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              Ми будуємо організацію, де є:
            </p>

            <ul style={{ marginBottom: '2rem', marginLeft: '2rem', listStyle: 'disc' }}>
              <li style={{ marginBottom: '1rem' }}>
                <strong>спільнота</strong> — для взаємодопомоги, навчання, подій, підтримки ініціатив;
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>ядро Ордену</strong> — дисциплінована команда, що здатна організовано діяти, вести місії, координувати ресурси, підтримувати членів;
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>порядок</strong> — через внутрішні правила та Суд Честі, який допомагає вирішувати спірні ситуації, захищати репутацію та зберігати братерство.
              </li>
            </ul>

            <p style={{ marginBottom: '2rem' }}>
              Орден Ветеранів не є політичною партією. Ми — громадська структура, яка працює з конкретними потребами і конкретними діями: захист прав, підтримка, адаптація, розвиток та громадянські ініціативи. Ми віримо, що сильна країна тримається на сильних спільнотах. А сильні спільноти тримаються на довірі, дисципліні та повазі до честі людини.
            </p>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
              <Link href="/join" className="btn" style={{ padding: '20px 40px' }}>
                ПРИЄДНАТИСЯ →
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
