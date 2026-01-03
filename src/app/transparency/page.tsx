'use client';

import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function TransparencyPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ЗВІТНІСТЬ"
          title="ПРОЗОРІСТЬ ТА ЗВІТНІСТЬ"
          description="Публічна звітність про діяльність та фінанси організації."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '4rem' }}>
              Прозорість — це не декларація, а щоденна практика. Ми публікуємо звіти про нашу діяльність, фінанси та досягнення цілей.
            </p>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', background: 'rgba(0,0,0,0.03)' }}>
              <p className="label" style={{ marginBottom: '1rem' }}>ЗВІТИ</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Перший звіт буде опубліковано після завершення першого кварталу діяльності організації.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
