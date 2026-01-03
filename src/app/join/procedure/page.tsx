'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function JoinProcedurePage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ПРОЦЕС ВСТУПУ"
          title="ПРОЦЕДУРА ПРИЄДНАННЯ"
          description="Кроки для вступу до Спільноти або Ордену."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '4rem' }}>
              Процедура приєднання залежить від обраного формату участі.
            </p>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', marginBottom: '2rem' }}>
              <h3 className="syne" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1rem' }}>
                Спільнота (відкрита)
              </h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
                Заповнення заявки → Підтвердження участі → Доступ до подій та ініціатив
              </p>
            </div>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', background: 'var(--timber-dark)', color: 'var(--canvas)', marginBottom: '4rem' }}>
              <h3 className="syne" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1rem' }}>
                Орден (ядро)
              </h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
                Заповнення заявки → Перевірка → Співбесіда → Рішення про прийняття → Введення до складу
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/join" className="btn" style={{ padding: '20px 40px' }}>
                ПОДАТИ ЗАЯВКУ →
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
