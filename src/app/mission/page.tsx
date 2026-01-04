'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

const values = [
  { title: 'Честь', description: 'Не принижувати, не зраджувати, не руйнувати довіру.' },
  { title: 'Братерство', description: 'Підтримка побратима важливіша за особисті амбіції.' },
  { title: 'Відповідальність', description: 'Взявся за справу — доведи до кінця.' },
  { title: 'Дисципліна', description: 'Порядок у діях, у словах, у рішеннях.' },
  { title: 'Законність', description: 'Діяти в межах права, не підставляти людей і структуру.' },
  { title: 'Повага', description: 'Навіть у конфлікті залишатися людьми.' },
];

export default function MissionPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// НАША МЕТА"
        title="МІСІЯ ТА ЦІННОСТІ"
        description="Об'єднувати ветеранів і союзників у братерство честі та дії, яке забезпечує підтримку, захист і можливість будувати нове життя після служби."
      />

      <PageContent narrow>
        <p>
          Наша місія — <strong>об'єднувати ветеранів і союзників у братерство честі та дії</strong>, яке забезпечує підтримку, захист і можливість будувати нове життя після служби.
        </p>
        <p>
          Цінності Ордену — це не слова на банері. Це правила поведінки, які працюють щодня:
        </p>
      </PageContent>

      {/* Values Grid */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              {values.map((value, index) => (
                <SectionCard
                  key={index}
                  title={value.title}
                  subtitle={`// ${index + 1}`}
                  variant={index % 2 === 1 ? 'dark' : 'default'}
                >
                  {value.description}
                </SectionCard>
              ))}
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      <PageContent narrow>
        <p>
          Наш принцип простий: <strong>спочатку — діалог, потім — рішення</strong>. І якщо потрібна арбітражна точка — для цього існує Суд Честі.
        </p>
      </PageContent>

      {/* CTAs */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                ПРИЄДНАТИСЯ
              </HeavyCta>
              <HeavyCta href="/code-of-honor" variant="outline" size="lg">
                КОДЕКС ЧЕСТІ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
