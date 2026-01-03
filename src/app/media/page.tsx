'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function MediaPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ДЛЯ ПРЕСИ"
          title="МЕДІА ТА ПРЕС-КІТ"
          description="Матеріали для ЗМІ та партнерів."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '4rem' }}>
              Медіа-запити та інформація для преси.
            </p>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', marginBottom: '2rem' }}>
              <h3 className="syne" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1rem' }}>
                Для медіа-запитів:
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '1rem' }}>
                Email: <a href="mailto:media@veterans-orden.org" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>media@veterans-orden.org</a>
              </p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Ми відповідаємо на медіа-запити протягом 24-48 годин.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/contacts" className="btn" style={{ padding: '20px 40px' }}>
                КОНТАКТИ →
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
