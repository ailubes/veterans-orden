'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function PartnershipPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="СПІВПРАЦЯ"
          title="ПАРТНЕРСТВО"
          description="Можливості партнерства для бізнесу та організацій."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Партнерство з Орденом Ветеранів може бути фінансовим, ресурсним або організаційним.
            </p>

            <p style={{ marginBottom: '4rem' }}>
              Якщо ваша організація зацікавлена у співпраці — зв'яжіться з нами для обговорення можливостей.
            </p>

            <div style={{ textAlign: 'center' }}>
              <Link href="/contacts" className="btn" style={{ padding: '20px 40px' }}>
                ЗВ'ЯЗАТИСЯ →
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
