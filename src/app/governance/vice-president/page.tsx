'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function VicePresidentPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ТРІАДА УПРАВЛІННЯ"
        title="ВІЦЕ-ПРЕЗИДЕНТ ОРДЕНУ ВЕТЕРАНІВ"
        description="Операційна координація. Виконання. Порядок у процесах."
      />

      <PageContent narrow>
        <p>
          Віце-президент відповідає за <strong>операційну реальність</strong>: щоб рішення не зависали "в повітрі", щоб задачі не губилися, щоб команди працювали, а ініціативи завершувалися результатом.
        </p>

        <h2>Віце-президент:</h2>

        <ul>
          <li>координує роботу напрямів та команд;</li>
          <li>формує "рельси" процесів: задачі, дедлайни, відповідальних, звітність;</li>
          <li>відповідає за внутрішню комунікацію та збір зворотного зв'язку;</li>
          <li>допомагає осередкам і командам масштабуватися без хаосу.</li>
        </ul>

        <p>
          Орден тримається не на красивих словах, а на виконанні. Роль Віце-президента — робити виконання системним.
        </p>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Потрібно долучитися до роботи або взяти задачу?</h2>
            <p className="cta-desc">
              Напишіть через форму "Приєднатися" або "Контакти".
            </p>
            <CtaGroup>
              <HeavyCta href="/join" variant="primary">
                ПРИЄДНАТИСЯ
              </HeavyCta>
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
