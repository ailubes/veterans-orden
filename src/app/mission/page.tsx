'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

const values = [
  { title: 'Честь', description: 'Не принижувати, не зраджувати, не руйнувати довіру.' },
  { title: 'Братерство', description: 'Підтримка побратима важливіша за особисті амбіції.' },
  { title: 'Відповідальність', description: 'Взявся за справу — доведи до кінця.' },
  { title: 'Дисципліна', description: 'Порядок у діях, у словах, у рішеннях.' },
  { title: 'Законність', description: 'Діяти в межах права, не підставляти людей і структуру.' },
  { title: 'Повага', description: 'Навіть у конфлікті залишатися людьми.' },
];

export default function MissionPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="НАША МЕТА"
          title="МІСІЯ ТА ЦІННОСТІ"
          description="Об'єднувати ветеранів і союзників у братерство честі та дії, яке забезпечує підтримку, захист і можливість будувати нове життя після служби."
        />

        {/* Main Content */}
        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8, marginBottom: '4rem' }}>
            <p style={{ marginBottom: '2rem' }}>
              Наша місія — <strong>об'єднувати ветеранів і союзників у братерство честі та дії</strong>, яке забезпечує підтримку, захист і можливість будувати нове життя після служби.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              Цінності Ордену — це не слова на банері. Це правила поведінки, які працюють щодня:
            </p>
          </div>

          {/* Values Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {values.map((value, index) => (
              <div 
                key={index}
                style={{
                  padding: '2rem',
                  border: '2px solid var(--timber-dark)',
                  background: index % 2 === 0 ? 'var(--canvas)' : 'transparent'
                }}
              >
                <h3 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '1rem' }}>
                  {value.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Наш принцип простий: <strong>спочатку — діалог, потім — рішення</strong>. І якщо потрібна арбітражна точка — для цього існує Суд Честі.
            </p>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
              <Link href="/join" className="btn" style={{ padding: '20px 40px', marginRight: '1rem' }}>
                ПРИЄДНАТИСЯ →
              </Link>
              <Link href="/code-of-honor" className="btn" style={{ padding: '20px 40px', backgroundColor: 'transparent', border: '2px solid var(--timber-dark)' }}>
                КОДЕКС ЧЕСТІ
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
