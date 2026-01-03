'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function JoinPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ДОЛУЧИТИСЯ"
          title="ПРИЄДНАТИСЯ"
          description="Два формати участі: Спільнота та Орден."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8, marginBottom: '4rem' }}>
            <p style={{ marginBottom: '2rem' }}>
              Є два формати участі:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)' }}>
              <p className="label" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>ФОРМАТ 1</p>
              <h3 className="syne" style={{ fontSize: '28px', fontWeight: 700, marginBottom: '1rem' }}>
                Спільнота (відкрита)
              </h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.8 }}>
                Для тих, хто хоче бути поруч, підтримувати, волонтерити, долучатись до подій і ініціатив. Спільнота — це широка база взаємодопомоги та реальних зв'язків.
              </p>
            </div>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', background: 'var(--timber-dark)', color: 'var(--canvas)' }}>
              <p className="label" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>ФОРМАТ 2</p>
              <h3 className="syne" style={{ fontSize: '28px', fontWeight: 700, marginBottom: '1rem' }}>
                Орден (ядро)
              </h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.9 }}>
                Для тих, хто готовий до дисципліни, місій, внутрішніх правил, відповідальності і служіння структурі. Вступ — за запрошенням або через процедуру відбору. Це робиться не для "закритості", а для довіри та безпеки.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Заповніть заявку — і ми запропонуємо найкращий формат участі.
            </p>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
              <Link href="#join-form" className="btn" style={{ padding: '20px 40px', marginRight: '1rem' }}>
                ПОДАТИ ЗАЯВКУ →
              </Link>
              <Link href="/join/procedure" className="btn" style={{ padding: '20px 40px', backgroundColor: 'transparent', border: '2px solid var(--timber-dark)' }}>
                ПРОЦЕДУРА ВСТУПУ
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
