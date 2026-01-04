'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function HelpRequestPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ЗАПИТ НА ДОПОМОГУ"
        title="ПОТРІБНА ДОПОМОГА"
        description="Контакт, маршрут і підтримка — те, що насправді цінне."
      />

      <PageContent narrow>
        <p>
          Якщо вам потрібна допомога — залиште заявку. Ми не обіцяємо "магії", але ми забезпечуємо те, що насправді цінне: <strong>контакт, маршрут і підтримку</strong>.
        </p>

        <p>Залежно від ситуації ми:</p>

        <ul>
          <li>зорієнтуємо щодо наступного кроку;</li>
          <li>порадимо юридичну траєкторію;</li>
          <li>допоможемо знайти фахівця або групу підтримки;</li>
          <li>підключимо партнерів або ресурси спільноти.</li>
        </ul>

        <p style={{ padding: '1.5rem', background: 'var(--bg-elevated)', border: '2px solid var(--border-color)' }}>
          <strong>Важливо:</strong> ваша заявка — конфіденційна. Ми використовуємо дані лише для зворотного зв'язку.
        </p>
      </PageContent>

      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">ГОТОВІ ЗВЕРНУТИСЯ?</h2>
            <p className="cta-desc" style={{ margin: '0 auto 2rem' }}>
              Опишіть вашу ситуацію — ми відповімо
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/contacts" variant="primary" size="lg">
                ЗВ'ЯЗАТИСЯ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
