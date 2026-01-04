'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function SupportPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ФІНАНСОВА ПІДТРИМКА"
        title="ПІДТРИМАТИ"
        description="Внесок у конкретну систему: підтримку ветеранів, адаптацію, захист прав, психологічні маршрути та громадянські ініціативи."
      />

      <PageContent narrow>
        <p>
          Підтримка Ордену Ветеранів — це не "донат у порожнечу". Це внесок у конкретну систему:
          підтримку ветеранів, адаптацію, захист прав, психологічні маршрути, навчальні події та громадянські ініціативи.
        </p>

        <p>
          Ми будуємо прозорий підхід: цілі зборів, підтверджувальні документи та звіти (у міру можливостей і потреб).
          Для нас важливо, щоб довіра була не словами, а механікою.
        </p>

        <p>
          Якщо ви бізнес або партнерська організація — зв'яжіться з нами.
          Партнерство може бути фінансовим, ресурсним або організаційним.
        </p>
      </PageContent>

      {/* CTAs */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/contacts" variant="primary" size="lg">
                ЗВ'ЯЗАТИСЯ
              </HeavyCta>
              <HeavyCta href="/support/partnership" variant="outline" size="lg">
                ПАРТНЕРСТВО
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
