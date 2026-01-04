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
        description="Реальний результат: підтримка ветеранів, програми адаптації, юридичні та психологічні маршрути."
      />

      <PageContent narrow>
        <p>
          Орден Ветеранів відкритий до партнерства з бізнесом, фондами, громадами, освітніми та медичними установами. Нас цікавлять партнерства, які дають <strong>реальний результат</strong>: підтримка ветеранів, програми адаптації, юридичні та психологічні маршрути, працевлаштування, навчання та інфраструктура спільнот.
        </p>

        <h2>Формати партнерства:</h2>

        <ul>
          <li><strong>Фінансова підтримка</strong> (цільові програми, закупівлі, стипендії, гранти)</li>
          <li><strong>Ресурсне партнерство</strong> (приміщення, обладнання, транспорт, послуги)</li>
          <li><strong>Експертна підтримка</strong> (юристи, психологи, тренери, ментори)</li>
          <li><strong>Комунікаційне партнерство</strong> (медіа, кампанії, інформаційна підтримка)</li>
        </ul>

        <p>
          Ми готові узгоджувати чіткі цілі, формат звітності та публічну прозорість у межах безпеки.
        </p>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Зацікавлені у партнерстві?</h2>
            <p className="cta-desc">
              Напишіть нам з темою "Партнерство" — і ми запропонуємо модель співпраці.
            </p>
            <CtaGroup>
              <HeavyCta href="/contacts" variant="primary">
                ЗВ'ЯЗАТИСЯ
              </HeavyCta>
              <HeavyCta href="/support" variant="outline">
                ← ПІДТРИМКА
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
