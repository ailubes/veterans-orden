'use client';

import Link from 'next/link';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { PageHeader } from '@/components/layout/page-header';

const programs = [
  { title: 'Адаптація', description: 'Ми допомагаємо ветеранам пройти шлях повернення до цивільного життя без хаосу: навігація, супровід, підказки, контакти, підтримка побратимів, наставництво. Адаптація — це не "порада", це маршрут.' },
  { title: 'Правовий захист', description: 'Звернення, консультації, супровід кейсів, захист прав ветеранів та їхніх родин. Ми працюємо з тим, щоб людина не відчувала себе безсилою перед бюрократією.' },
  { title: 'Психологічна підтримка', description: 'Ми не "лікуємо замість лікарів". Але ми робимо важливе: створюємо безпечний шлях до фахівця, груп підтримки або партнерських сервісів. Психологічна допомога — це частина відновлення, а не "слабкість".' },
  { title: 'Освіта та наставництво', description: 'Події, практичні тренінги, розвиток лідерів, обмін досвідом. Ветеранський потенціал має перетворюватися на компетенції, проєкти, роботу й вплив.' },
  { title: 'Громадянські кампанії', description: 'Коли проблема системна — потрібна системна дія. Ми запускаємо ініціативи, які захищають права і змінюють правила гри. Кампанії — це дисциплінована послідовність, а не емоційний спалах.' },
  { title: 'Взаємодопомога', description: 'Орден — це про "поруч є свої". Підтримка в складних ситуаціях, координація ресурсів, волонтерські місії, допомога родинам, включення в мережу людей, які реально роблять.' },
];

export default function DirectionsPage() {
  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh' }}>
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ЩО МИ РОБИМО"
          title="НАПРЯМИ"
          description="Шість ключових напрямків роботи Ордену Ветеранів."
        />

        <section style={{ gridColumn: '2 / 5', marginBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {programs.map((program, index) => (
              <div 
                key={index}
                style={{
                  padding: '2rem',
                  border: '2px solid var(--timber-dark)',
                  background: index === 0 || index === 5 ? 'var(--timber-dark)' : 'transparent',
                  color: index === 0 || index === 5 ? 'var(--canvas)' : 'var(--timber-dark)'
                }}
              >
                <p className="label" style={{ marginBottom: '1rem', color: index === 0 || index === 5 ? 'var(--accent)' : 'var(--timber-dark)' }}>
                  НАПРЯМ {index + 1}
                </p>
                <h3 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '1rem' }}>
                  {program.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>
                  {program.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <Link href="/join" className="btn" style={{ padding: '20px 40px' }}>
              ПРИЄДНАТИСЯ →
            </Link>
          </div>
        </section>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
