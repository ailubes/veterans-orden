'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function PartnershipPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// СПІВПРАЦЯ"
        title="ПАРТНЕРСТВО"
        description="Можливості партнерства для бізнесу та організацій."
      />

      <PageContent narrow>
        <p>
          Партнерство з Орденом Ветеранів може бути фінансовим, ресурсним або організаційним.
        </p>

        <p>
          Якщо ваша організація зацікавлена у співпраці — зв'яжіться з нами для обговорення можливостей.
        </p>
      </PageContent>

      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
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
