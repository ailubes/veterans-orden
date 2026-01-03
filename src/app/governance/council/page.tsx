'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function CouncilPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ТРІАДА УПРАВЛІННЯ"
          title="КОЛЕГІЯ МИСЛИТЕЛІВ"
          description="Стратегія, ідеологія та збереження принципів організації."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Колегія Мислителів (Батьки-засновники) — це інтелектуальний і моральний центр Ордену Ветеранів. Їхня роль не "керувати руками", а <strong>керувати напрямом</strong>: бачити ризики, формувати правила, створювати культуру, яка тримає структуру роками.
            </p>

            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4rem' }}>
              Інформація про склад Колегії Мислителів буде опубліковано після формування керівних органів.
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
