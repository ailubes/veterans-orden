'use client';

import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function CommanderiesPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="РЕГІОНАЛЬНА СТРУКТУРА"
          title="КОМЕНДАТУРИ"
          description="15 регіональних комендатур Ордену Ветеранів."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '4rem' }}>
              Орден Ветеранів будує децентралізовану структуру з регіональними комендатурами. Це дозволяє забезпечити локальну підтримку та координацію на місцях.
            </p>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', background: 'rgba(0,0,0,0.03)' }}>
              <p className="label" style={{ marginBottom: '1rem' }}>СТРУКТУРА</p>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '1rem' }}>
                5 макрорегіональних комендатур + 10 міських комендатур у великих містах України.
              </p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Детальна інформація про комендатури буде додана після завершення організаційного етапу.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
