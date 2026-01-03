'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function CodeOfHonorPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ПРАВИЛА СПІЛЬНОТИ"
          title="КОДЕКС ЧЕСТІ"
          description="Внутрішній етичний кодекс Ордену Ветеранів."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '4rem' }}>
              Кодекс Честі визначає стандарти поведінки для всіх членів Ордену Ветеранів. Це не формальність — це договір довіри, який захищає кожного члена та всю організацію.
            </p>

            <div style={{ padding: '2rem', border: '2px solid var(--timber-dark)', marginBottom: '2rem' }}>
              <h3 className="syne" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1rem' }}>
                Основні принципи:
              </h3>
              <ul style={{ marginLeft: '2rem', listStyle: 'disc' }}>
                <li style={{ marginBottom: '0.5rem' }}>Не принижувати і не ображати побратимів</li>
                <li style={{ marginBottom: '0.5rem' }}>Не зраджувати довіру організації</li>
                <li style={{ marginBottom: '0.5rem' }}>Виконувати взяті зобов'язання</li>
                <li style={{ marginBottom: '0.5rem' }}>Діяти в межах законодавства України</li>
                <li style={{ marginBottom: '0.5rem' }}>Вирішувати конфлікти через діалог та Суд Честі</li>
                <li style={{ marginBottom: '0.5rem' }}>Підтримувати репутацію Ордену</li>
              </ul>
            </div>

            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4rem' }}>
              Повний текст Кодексу Честі буде опубліковано після затвердження установчих документів.
            </p>

            <div style={{ textAlign: 'center' }}>
              <Link href="/honor-court" className="btn" style={{ padding: '20px 40px', marginRight: '1rem' }}>
                СУД ЧЕСТІ
              </Link>
              <Link href="/mission" className="btn" style={{ padding: '20px 40px', backgroundColor: 'transparent', border: '2px solid var(--timber-dark)' }}>
                МІСІЯ ТА ЦІННОСТІ
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
