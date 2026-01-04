'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function CodeOfHonorPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ПРАВИЛА СПІЛЬНОТИ"
        title="КОДЕКС ЧЕСТІ"
        description="Правила поведінки, які роблять спільноту сильною."
      />

      <PageContent narrow>
        <p>
          Кодекс Честі — це не "плакат". Це правила поведінки, які роблять спільноту сильною. Орден існує там, де люди довіряють одне одному, тримають слово і не руйнують братерство зсередини.
        </p>

        <h2>Основні положення Кодексу:</h2>

        <ol>
          <li><strong>Честь — перша.</strong> Ми не принижуємо, не зраджуємо, не маніпулюємо.</li>
          <li><strong>Братерство — вище за амбіції.</strong> Спільна справа важливіша за особисті конфлікти.</li>
          <li><strong>Слово має вагу.</strong> Домовленість — це зобов'язання.</li>
          <li><strong>Дисципліна в діях.</strong> Якщо взяв задачу — виконай або чесно передай.</li>
          <li><strong>Законність.</strong> Орден діє в межах права і не підставляє членів.</li>
          <li><strong>Відповідальність за репутацію.</strong> Ти відповідаєш не лише за себе, а й за довіру до спільноти.</li>
          <li><strong>Повага навіть у конфлікті.</strong> Ми не перетворюємо спір на приниження.</li>
          <li><strong>Допомога своїм.</strong> Ми не залишаємо побратима сам на сам із проблемою.</li>
          <li><strong>Прозорість у важливому.</strong> Рішення пояснюються, а не "спускаються".</li>
          <li><strong>Розвиток.</strong> Ми ростемо як люди і як структура, а не застрягаємо в минулому.</li>
        </ol>

        <p>
          Кодекс — це основа. Коли виникає спір, який не вирішується розмовою, працює Суд Честі.
        </p>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Питання щодо Кодексу?</h2>
            <p className="cta-desc">
              Зверніться до Суду Честі або напишіть нам через форму контактів.
            </p>
            <CtaGroup>
              <HeavyCta href="/honor-court" variant="primary">
                СУД ЧЕСТІ
              </HeavyCta>
              <HeavyCta href="/mission" variant="outline">
                МІСІЯ ТА ЦІННОСТІ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
