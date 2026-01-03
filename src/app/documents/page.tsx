'use client';

import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function DocumentsPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ПРОЗОРІСТЬ"
          title="ДОКУМЕНТИ"
          description="Статутні документи, політики та реквізити організації."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Розділ "Документи" створено для прозорості та довіри. Тут публікуються:
            </p>

            <ul style={{ marginBottom: '4rem', marginLeft: '2rem', listStyle: 'disc' }}>
              <li style={{ marginBottom: '1rem' }}>статутні документи,</li>
              <li style={{ marginBottom: '1rem' }}>підтвердження неприбуткового статусу,</li>
              <li style={{ marginBottom: '1rem' }}>політики (конфіденційність, етика),</li>
              <li style={{ marginBottom: '1rem' }}>звітність і матеріали (за наявності),</li>
              <li style={{ marginBottom: '1rem' }}>реквізити для підтримки.</li>
            </ul>

            <p style={{ marginBottom: '4rem' }}>
              Це важливо не лише для донорів і партнерів. Це важливо для кожного, хто хоче бачити, що організація — реальна, юридично оформлена і працює на довгій дистанції.
            </p>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', background: 'rgba(0,0,0,0.03)' }}>
              <p className="label" style={{ marginBottom: '1rem' }}>ДОКУМЕНТИ</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Розділ буде доповнено після завершення процедури реєстрації організації.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
