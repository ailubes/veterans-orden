'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function CouncilPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ТРІАДА УПРАВЛІННЯ"
        title="КОЛЕГІЯ МИСЛИТЕЛІВ"
        description="Стратегія, ідеологія та збереження принципів організації."
      />

      <PageContent narrow>
        <p>
          Колегія Мислителів (Батьки-засновники) — це інтелектуальний і моральний центр Ордену Ветеранів. Їхня роль не "керувати руками", а <strong>керувати напрямом</strong>: бачити ризики, формувати правила, створювати культуру, яка тримає структуру роками.
        </p>

        <p style={{ opacity: 0.7 }}>
          Інформація про склад Колегії Мислителів буде опубліковано після формування керівних органів.
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
