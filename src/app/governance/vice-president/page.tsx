'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function VicePresidentPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ТРІАДА УПРАВЛІННЯ"
          title="ВІЦЕ-ПРЕЗИДЕНТ"
          description="Операційна координація та контроль процесів."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Віце-президент Ордену Ветеранів відповідає за операційну координацію, виконання рішень та контроль внутрішніх процесів.
            </p>

            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4rem' }}>
              Детальна інформація про Віце-президента буде опубліковано після обрання керівних органів.
            </p>

            <div style={{ textAlign: 'center' }}>
              <Link href="/governance" className="btn" style={{ padding: '20px 40px' }}>
                ← НАЗАД ДО УПРАВЛІННЯ
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
