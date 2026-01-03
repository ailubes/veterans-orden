'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function HonorCourtPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ВНУТРІШНІЙ АРБІТРАЖ"
          title="СУД ЧЕСТІ"
          description="Механізм вирішення конфліктів, захисту репутації та збереження братерства."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Кожна реальна спільнота стикається з конфліктами. Проблема не в тому, що вони виникають. Проблема — коли конфлікти руйнують довіру, тягнуть організацію вниз і перетворюють її на хаос.
            </p>

            <p style={{ marginBottom: '2rem', fontWeight: 700, fontSize: '20px' }}>
              Суд Честі створено як внутрішній механізм:
            </p>

            <ul style={{ marginBottom: '2rem', marginLeft: '2rem', listStyle: 'disc' }}>
              <li style={{ marginBottom: '1rem' }}>для примирення сторін,</li>
              <li style={{ marginBottom: '1rem' }}>для оцінки дотримання Кодексу,</li>
              <li style={{ marginBottom: '1rem' }}>для захисту честі та репутації членів,</li>
              <li style={{ marginBottom: '1rem' }}>для дисциплінарних рішень у складних випадках.</li>
            </ul>

            <p style={{ marginBottom: '2rem' }}>
              Суд Честі не підмінює державні органи і діє в межах законодавства України. Його роль — зберегти братерство і порядок там, де зовнішні механізми або повільні, або не працюють на рівні людської довіри.
            </p>

            <p style={{ marginBottom: '4rem', fontWeight: 700, fontSize: '20px' }}>
              Ми віримо: порядок всередині — це гарантія сили зовні.
            </p>

            <div style={{ textAlign: 'center' }}>
              <Link href="/code-of-honor" className="btn" style={{ padding: '20px 40px' }}>
                КОДЕКС ЧЕСТІ →
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
