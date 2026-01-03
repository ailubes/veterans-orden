'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function GovernancePage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="СТРУКТУРА"
          title="УПРАВЛІННЯ"
          description="Тріада управління: Президент, Віце-президент та Колегія Мислителів."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8, marginBottom: '4rem' }}>
            <p style={{ marginBottom: '2rem' }}>
              Орден Ветеранів будує структуру так, щоб вона <strong>не залежала від однієї людини</strong> та не розвалювалася через амбіції. Для цього введена <strong>Тріада управління</strong>:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '4rem' }}>
            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)' }}>
              <p className="label" style={{ marginBottom: '1rem' }}>ПОЗИЦІЯ 1</p>
              <h3 className="syne" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '1rem' }}>
                Президент
              </h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.8, marginBottom: '1rem' }}>
                Виконавча відповідальність, представництво, легітимність рішень.
              </p>
              <Link href="/governance/president" style={{ fontSize: '14px', color: 'var(--accent)', textDecoration: 'underline' }}>
                Детальніше →
              </Link>
            </div>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)' }}>
              <p className="label" style={{ marginBottom: '1rem' }}>ПОЗИЦІЯ 2</p>
              <h3 className="syne" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '1rem' }}>
                Віце-президент
              </h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.8, marginBottom: '1rem' }}>
                Операційна координація, виконання, контроль процесів.
              </p>
              <Link href="/governance/vice-president" style={{ fontSize: '14px', color: 'var(--accent)', textDecoration: 'underline' }}>
                Детальніше →
              </Link>
            </div>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', background: 'var(--timber-dark)', color: 'var(--canvas)' }}>
              <p className="label" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>ПОЗИЦІЯ 3</p>
              <h3 className="syne" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '1rem' }}>
                Колегія Мислителів
              </h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.9, marginBottom: '1rem' }}>
                Стратегія, ідеологія, збереження принципів, довгий горизонт планування.
              </p>
              <Link href="/governance/council" style={{ fontSize: '14px', color: 'var(--accent)', textDecoration: 'underline' }}>
                Детальніше →
              </Link>
            </div>
          </div>

          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p>
              Колегія Мислителів — це люди, чия роль не "керувати руками", а <strong>керувати напрямом</strong>: бачити ризики, формувати правила, створювати культуру, яка тримає структуру роками. Це інтелектуальний і моральний центр, який підсилює стабільність і не дає організації зійти з рейок.
            </p>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
