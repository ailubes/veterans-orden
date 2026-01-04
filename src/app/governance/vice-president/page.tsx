'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function VicePresidentPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ТРІАДА УПРАВЛІННЯ"
        title="ВІЦЕ-ПРЕЗИДЕНТ"
        description="Операційна координація та контроль процесів."
      />

      <PageContent narrow>
        <p>
          Віце-президент Ордену Ветеранів відповідає за операційну координацію, виконання рішень та контроль внутрішніх процесів.
        </p>

        <p style={{ opacity: 0.7 }}>
          Детальна інформація про Віце-президента буде опубліковано після обрання керівних органів.
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
