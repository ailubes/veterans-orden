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
        description="Стратегія. Принципи. Довгий горизонт."
      />

      <PageContent narrow>
        <p>
          Будь-яка організація може "горіти" швидко. Але не кожна може жити довго. Колегія Мислителів — це структура, яка відповідає за <strong>довгострокову стійкість</strong>: щоб Орден не збився з курсу і не перетворився на хаотичний гурток або чиюсь приватну історію.
        </p>

        <h2>Колегія Мислителів (Батьки-засновники):</h2>

        <ul>
          <li>зберігає ідеологію та базові принципи;</li>
          <li>формує довгострокову стратегію розвитку;</li>
          <li>контролює дотримання внутрішніх правил;</li>
          <li>підтримує стабільність у разі криз чи конфліктів;</li>
          <li>запобігає "приватизації" організації однією особою чи групою.</li>
        </ul>

        <p>
          Їхня роль не "керувати руками", а <strong>керувати напрямом</strong>: бачити ризики, формувати правила, створювати культуру, яка тримає структуру роками. Це інтелектуальний і моральний центр, який підсилює стабільність і не дає організації зійти з рейок.
        </p>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Маєте стратегічне бачення?</h2>
            <p className="cta-desc">
              Зв'яжіться з нами для обговорення довгострокових ініціатив.
            </p>
            <CtaGroup>
              <HeavyCta href="/contacts" variant="primary">
                КОНТАКТИ
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
