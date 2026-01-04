'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function PresidentPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ТРІАДА УПРАВЛІННЯ"
        title="ПРЕЗИДЕНТ"
        description="Виконавча відповідальність та представництво організації."
      />

      <PageContent narrow>
        <p>
          Президент Ордену Ветеранів відповідає за виконавчу діяльність, представництво та легітимність рішень організації.
        </p>

        <p style={{ opacity: 0.7 }}>
          Детальна інформація про Президента буде опубліковано після обрання керівних органів.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/governance" variant="outline">
                ← НАЗАД ДО УПРАВЛІННЯ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
