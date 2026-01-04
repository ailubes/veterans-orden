'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard } from '@/components/ui/section-card';

export default function TransparencyPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ЗВІТНІСТЬ"
        title="ПРОЗОРІСТЬ ТА ЗВІТНІСТЬ"
        description="Публічна звітність про діяльність та фінанси організації."
      />

      <PageContent narrow>
        <p>
          Прозорість — це не декларація, а щоденна практика. Ми публікуємо звіти про нашу діяльність, фінанси та досягнення цілей.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-8">
            <SectionCard
              title="Звіти"
              subtitle="// ПРОЗОРІСТЬ"
            >
              <p style={{ opacity: 0.7 }}>
                Перший звіт буде опубліковано після завершення першого кварталу діяльності організації.
              </p>
            </SectionCard>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
