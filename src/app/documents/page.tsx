'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard } from '@/components/ui/section-card';

export default function DocumentsPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ПРОЗОРІСТЬ"
        title="ДОКУМЕНТИ"
        description="Статутні документи, політики та реквізити організації."
      />

      <PageContent narrow>
        <p>
          Розділ "Документи" створено для прозорості та довіри. Тут публікуються:
        </p>

        <ul>
          <li>статутні документи,</li>
          <li>підтвердження неприбуткового статусу,</li>
          <li>політики (конфіденційність, етика),</li>
          <li>звітність і матеріали (за наявності),</li>
          <li>реквізити для підтримки.</li>
        </ul>

        <p>
          Це важливо не лише для донорів і партнерів. Це важливо для кожного, хто хоче бачити, що організація — реальна, юридично оформлена і працює на довгій дистанції.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-8">
            <SectionCard
              title="Документи"
              subtitle="// СТАТУС"
            >
              <p style={{ opacity: 0.7 }}>
                Розділ буде доповнено після завершення процедури реєстрації організації.
              </p>
            </SectionCard>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
