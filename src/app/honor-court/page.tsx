'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function HonorCourtPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ВНУТРІШНІЙ АРБІТРАЖ"
        title="СУД ЧЕСТІ"
        description="Механізм вирішення конфліктів, захисту репутації та збереження братерства."
      />

      <PageContent narrow>
        <p>
          Кожна реальна спільнота стикається з конфліктами. Проблема не в тому, що вони виникають. Проблема — коли конфлікти руйнують довіру, тягнуть організацію вниз і перетворюють її на хаос.
        </p>

        <h2>Суд Честі створено як внутрішній механізм:</h2>

        <ul>
          <li>для примирення сторін,</li>
          <li>для оцінки дотримання Кодексу,</li>
          <li>для захисту честі та репутації членів,</li>
          <li>для дисциплінарних рішень у складних випадках.</li>
        </ul>

        <p>
          Суд Честі не підмінює державні органи і діє в межах законодавства України. Його роль — зберегти братерство і порядок там, де зовнішні механізми або повільні, або не працюють на рівні людської довіри.
        </p>

        <p style={{ fontWeight: 700 }}>
          Ми віримо: порядок всередині — це гарантія сили зовні.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/code-of-honor" variant="primary">
                КОДЕКС ЧЕСТІ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
