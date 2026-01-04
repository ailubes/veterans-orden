'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function CodeOfHonorPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ПРАВИЛА СПІЛЬНОТИ"
        title="КОДЕКС ЧЕСТІ"
        description="Внутрішній етичний кодекс Ордену Ветеранів."
      />

      <PageContent narrow>
        <p>
          Кодекс Честі визначає стандарти поведінки для всіх членів Ордену Ветеранів. Це не формальність — це договір довіри, який захищає кожного члена та всю організацію.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-8">
            <SectionCard
              title="Основні принципи"
              subtitle="// КОДЕКС"
            >
              <ul>
                <li>Не принижувати і не ображати побратимів</li>
                <li>Не зраджувати довіру організації</li>
                <li>Виконувати взяті зобов'язання</li>
                <li>Діяти в межах законодавства України</li>
                <li>Вирішувати конфлікти через діалог та Суд Честі</li>
                <li>Підтримувати репутацію Ордену</li>
              </ul>
            </SectionCard>
          </div>
        </Scaffold>
      </section>

      <PageContent narrow>
        <p style={{ opacity: 0.7 }}>
          Повний текст Кодексу Честі буде опубліковано після затвердження установчих документів.
        </p>
      </PageContent>

      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/honor-court" variant="primary" size="lg">
                СУД ЧЕСТІ
              </HeavyCta>
              <HeavyCta href="/mission" variant="outline" size="lg">
                МІСІЯ ТА ЦІННОСТІ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
