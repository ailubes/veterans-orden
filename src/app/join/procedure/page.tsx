'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function JoinProcedurePage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ПРОЦЕС ВСТУПУ"
        title="ПРОЦЕДУРА ПРИЄДНАННЯ"
        description="Кроки для вступу до Спільноти або Ордену."
      />

      <PageContent narrow>
        <p>
          Процедура приєднання залежить від обраного формату участі.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={2}>
              <SectionCard
                title="Спільнота (відкрита)"
                subtitle="// ФОРМАТ 1"
              >
                <p>
                  Заповнення заявки → Підтвердження участі → Доступ до подій та ініціатив
                </p>
              </SectionCard>
              <SectionCard
                title="Орден (ядро)"
                subtitle="// ФОРМАТ 2"
                variant="dark"
              >
                <p>
                  Заповнення заявки → Перевірка → Співбесіда → Рішення про прийняття → Введення до складу
                </p>
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                ПОДАТИ ЗАЯВКУ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
