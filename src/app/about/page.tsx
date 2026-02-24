'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Breadcrumb */}
      <section className="section-sm">
        <Scaffold>
          <div className="col-span-full">
            <Breadcrumb
              items={[
                { label: 'Головна', href: '/' },
                { label: 'Про Орден' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// ПРО ОРДЕН"
        title="ФІЛОСОФІЯ ТА ДІЯ"
        description="ГО «Орден Ветеранів» — це не реабілітаційний центр, не благодійний фонд і не клуб за інтересами. Це структурована спільнота взаємної підтримки, яка трансформує ветеранів у самодостатніх лідерів."
      />

      <PageContent narrow>
        <p>
          ГО «Орден Ветеранів» будує систему, в якій ветеран не просить — а діє. Не чекає на допомогу — а організовує її. Не адаптується до суспільства — а формує нові стандарти в ньому.
        </p>
        <p>
          Орден — це братерство. Якщо ти готовий прийти на допомогу побратиму, побратими теж прийдуть на допомогу. Це не декларація — це принцип, який перевіряється в дії.
        </p>

        <h2>СТРУКТУРА</h2>
        <p>Орден побудований на трьох рівнях, кожен з яких має чітку роль:</p>
      </PageContent>

      {/* Structure Cards */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="СПІЛЬНОТА"
                subtitle="// ВІДКРИТИЙ ФОРМАТ"
                href="/join"
              >
                Відкрите громадське крило. Участь у подіях, підтримка ініціатив, волонтерство, навчання, взаємодопомога. Вступ: заява та прийняття символіки організації.
                <div className="pill" style={{ marginTop: '1rem' }}>Відкритий вступ</div>
              </SectionCard>
              <SectionCard
                title="ЯДРО"
                subtitle="// ОРДЕН"
                href="/join/procedure"
                variant="dark"
              >
                Дисципліноване ядро Ордену. Операційна дія, координація, безпека, підтримка спільноти, виконання місій. Вступ: запрошення, випробування, посвята.
                <div className="pill" style={{ marginTop: '1rem' }}>За запрошенням</div>
              </SectionCard>
              <SectionCard
                title="НАРАДА"
                subtitle="// ВНУТРІШНІЙ ПОРЯДОК"
                href="/governance"
              >
                Внутрішній механізм вирішення спорів та захисту честі. Нарада утримує спільноту від руйнування зсередини та приймає стратегічні рішення.
                <div className="pill" style={{ marginTop: '1rem' }}>Принцип: "спочатку діалог"</div>
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      <PageContent narrow>
        <h2>ГОЛОВНИЙ НАПРЯМОК: БІЗНЕС-ІНКУБАТОР</h2>
        <p>
          Ми не готуємо ветеранів до роботи на «дядю». Наш фокус — ветеран як власник власної справи.
        </p>
        <ul>
          <li><strong>Банк готових рішень</strong> — бізнес-моделі, перевірені реальним досвідом</li>
          <li><strong>Фінансова навігація</strong> — пошук грантів та підготовка заявок</li>
          <li><strong>Інфраструктура</strong> — допомога з пошуком приміщень та землі для старту</li>
          <li><strong>Навчання</strong> — прикладні знання для створення та управління власним бізнесом</li>
          <li><strong>Партнерська підтримка</strong> — супровід на ключових етапах розвитку бізнесу</li>
        </ul>
        <p>
          Орден уже має успішні приклади ветеранських бізнесів, які працюють і розвиваються. Це не теорія — це практика.
        </p>

        <h2>ПРИНЦИПИ</h2>
        <p style={{ fontWeight: 700 }}>
          Ветерани змогли захистити країну. Ветерани мають право на гідне життя.
        </p>
        <p>
          Орден будує систему, де кожен член має доступ до братерської мережі підтримки, знань, ресурсів та можливостей. Внутрішня дисципліна, чіткі правила та взаємна відповідальність — це не обмеження, а сила.
        </p>
      </PageContent>

      {/* CTA */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">Готовий стати частиною Ордену?</h2>
            <p className="cta-desc">
              Обери свій формат участі. Орден відкритий для тих, хто готовий діяти.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                СТАТИ УЧАСНИКОМ
              </HeavyCta>
              <HeavyCta href="/directions" variant="outline" size="lg">
                НАПРЯМИ РОБОТИ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
