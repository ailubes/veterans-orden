'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function SupportPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ФІНАНСОВА ПІДТРИМКА"
          title="ПІДТРИМАТИ"
          description="Внесок у конкретну систему: підтримку ветеранів, адаптацію, захист прав, психологічні маршрути та громадянські ініціативи."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Підтримка Ордену Ветеранів — це не "донат у порожнечу". Це внесок у конкретну систему: підтримку ветеранів, адаптацію, захист прав, психологічні маршрути, навчальні події та громадянські ініціативи.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              Ми будуємо прозорий підхід: цілі зборів, підтверджувальні документи та звіти (у міру можливостей і потреб). Для нас важливо, щоб довіра була не словами, а механікою.
            </p>

            <p style={{ marginBottom: '4rem' }}>
              Якщо ви бізнес або партнерська організація — зв'яжіться з нами. Партнерство може бути фінансовим, ресурсним або організаційним.
            </p>

            <div style={{ textAlign: 'center' }}>
              <Link href="/contacts" className="btn" style={{ padding: '20px 40px', marginRight: '1rem' }}>
                ЗВ'ЯЗАТИСЯ →
              </Link>
              <Link href="/support/partnership" className="btn" style={{ padding: '20px 40px', backgroundColor: 'transparent', border: '2px solid var(--timber-dark)' }}>
                ПАРТНЕРСТВО
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
