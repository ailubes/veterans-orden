'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard } from '@/components/ui/section-card';

export default function CommanderiesPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// РЕГІОНАЛЬНА СТРУКТУРА"
        title="КОМЕНДАТУРИ"
        description="15 регіональних комендатур Ордену Ветеранів."
      />

      <PageContent narrow>
        <p>
          Орден Ветеранів будує децентралізовану структуру з регіональними комендатурами. Це дозволяє забезпечити локальну підтримку та координацію на місцях.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-8">
            <SectionCard
              title="Структура"
              subtitle="// КОМЕНДАТУРИ"
            >
              <p style={{ marginBottom: '1rem' }}>
                5 макрорегіональних комендатур + 10 міських комендатур у великих містах України.
              </p>
              <p style={{ opacity: 0.7 }}>
                Детальна інформація про комендатури буде додана після завершення організаційного етапу.
              </p>
            </SectionCard>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
