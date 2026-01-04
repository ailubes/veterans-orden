'use client';

import Link from 'next/link';
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard } from '@/components/ui/section-card';

export default function GovernancePage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// СТРУКТУРА"
        title="УПРАВЛІННЯ"
        description="Тріада управління: Президент, Віце-президент та Колегія Мислителів."
      />

      <PageContent narrow>
        <p>
          Орден Ветеранів будує структуру так, щоб вона <strong>не залежала від однієї людини</strong> та не розвалювалася через амбіції. Для цього введена <strong>Тріада управління</strong>:
        </p>
      </PageContent>

      {/* Triad Grid */}
      <section className="section">
        <Scaffold>
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SectionCard
              title="Президент"
              subtitle="// ПОЗИЦІЯ 1"
              href="/governance/president"
            >
              Виконавча відповідальність, представництво, легітимність рішень.
            </SectionCard>

            <SectionCard
              title="Віце-президент"
              subtitle="// ПОЗИЦІЯ 2"
              href="/governance/vice-president"
            >
              Операційна координація, виконання, контроль процесів.
            </SectionCard>

            <SectionCard
              title="Колегія Мислителів"
              subtitle="// ПОЗИЦІЯ 3"
              href="/governance/council"
              variant="dark"
            >
              Стратегія, ідеологія, збереження принципів, довгий горизонт планування.
            </SectionCard>
          </div>
        </Scaffold>
      </section>

      <PageContent narrow>
        <p>
          Колегія Мислителів — це люди, чия роль не "керувати руками", а <strong>керувати напрямом</strong>: бачити ризики, формувати правила, створювати культуру, яка тримає структуру роками. Це інтелектуальний і моральний центр, який підсилює стабільність і не дає організації зійти з рейок.
        </p>
      </PageContent>
    </PageLayout>
  );
}
