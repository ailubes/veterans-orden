'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

export default function HelpRequestPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ЗАПИТ НА ДОПОМОГУ"
          title="ПОТРІБНА ДОПОМОГА"
          description="Ми забезпечуємо контакт, маршрут і підтримку."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '800px', fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '2rem' }}>
              Якщо вам потрібна допомога — залиште заявку. Ми не обіцяємо "магії", але ми забезпечуємо те, що насправді цінне: <strong>контакт, маршрут і підтримку</strong>.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              Залежно від ситуації ми:
            </p>

            <ul style={{ marginBottom: '2rem', marginLeft: '2rem', listStyle: 'disc' }}>
              <li style={{ marginBottom: '1rem' }}>зорієнтуємо щодо наступного кроку;</li>
              <li style={{ marginBottom: '1rem' }}>порадимо юридичну траєкторію;</li>
              <li style={{ marginBottom: '1rem' }}>допоможемо знайти фахівця або групу підтримки;</li>
              <li style={{ marginBottom: '1rem' }}>підключимо партнерів або ресурси спільноти.</li>
            </ul>

            <p style={{ marginBottom: '4rem', fontSize: '16px', padding: '1rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--timber-dark)' }}>
              <strong>Важливо:</strong> ваша заявка — конфіденційна. Ми використовуємо дані лише для зворотного зв'язку.
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
