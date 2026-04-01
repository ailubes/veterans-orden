'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useLocale } from 'next-intl';

export default function AboutPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  if (isEn) {
    return (
      <PageLayout>
        <section className="section-sm">
          <Scaffold>
            <div className="col-span-full">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'About Order' },
                ]}
              />
            </div>
          </Scaffold>
        </section>

        <PageHeader
          subtitle="// ABOUT ORDER"
          title="PHILOSOPHY AND EXECUTION"
          description="Order of Veterans is a structured community of mutual support that transforms combat experience into leadership, responsibility, and civic impact."
        />

        <PageContent narrow>
          <p>
            We are not a symbolic club and not a passive support structure. We build an operating system where veterans act,
            coordinate, and strengthen each other through practical work.
          </p>
          <p>
            Brotherhood is not a slogan here. If you show up for your peers, your peers show up for you.
          </p>

          <h2>STRUCTURE</h2>
          <p>Order operates through three linked layers:</p>
        </PageContent>

        <section className="section" style={{ background: 'var(--bg-elevated)' }}>
          <Scaffold>
            <div className="col-span-full">
              <SectionCardGrid columns={3}>
                <SectionCard title="COMMUNITY" subtitle="// OPEN FORMAT" href="/join">
                  Open civic layer: events, initiatives, volunteering, learning, and mutual support.
                  <div className="pill" style={{ marginTop: '1rem' }}>Open enrollment</div>
                </SectionCard>
                <SectionCard title="CORE" subtitle="// ORDER" href="/join/procedure" variant="dark">
                  Disciplined core: operations, coordination, security, and mission execution.
                  <div className="pill" style={{ marginTop: '1rem' }}>By invitation</div>
                </SectionCard>
                <SectionCard title="COUNCIL" subtitle="// INTERNAL ORDER" href="/honor-court">
                  Internal dispute resolution, integrity safeguards, and strategic balance.
                  <div className="pill" style={{ marginTop: '1rem' }}>Dialogue first</div>
                </SectionCard>
              </SectionCardGrid>
            </div>
          </Scaffold>
        </section>

        <PageContent narrow>
          <h2>KEY DIRECTION: BUSINESS INCUBATOR</h2>
          <p>
            We focus on veteran-owned outcomes. The goal is not dependency, but ownership, economic autonomy, and durable teams.
          </p>
          <ul>
            <li><strong>Ready-made business models</strong> validated in practice</li>
            <li><strong>Funding navigation</strong> for grants and financing</li>
            <li><strong>Infrastructure support</strong> for facilities and launch conditions</li>
            <li><strong>Applied education</strong> for management and operations</li>
            <li><strong>Partner support</strong> at key growth stages</li>
          </ul>
          <p>
            We already have working veteran-run businesses in the network. This is applied execution, not theory.
          </p>

          <h2>PRINCIPLES</h2>
          <p style={{ fontWeight: 700 }}>
            Veterans defended the country. Veterans deserve a strong and dignified civilian future.
          </p>
          <p>
            Our system is built on discipline, standards, and shared responsibility. These are not restrictions;
            they are the operating conditions for trust and long-term results.
          </p>
        </PageContent>

        <section className="section-lg cta-section-join">
          <Scaffold>
            <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
              <h2 className="cta-title">Ready to join?</h2>
              <p className="cta-desc">Choose your participation path and become part of the Order.</p>
              <CtaGroup align="center">
                <HeavyCta href="/join" variant="primary" size="lg">
                  BECOME A MEMBER
                </HeavyCta>
                <HeavyCta href="/directions" variant="outline" size="lg">
                  PROGRAMS
                </HeavyCta>
              </CtaGroup>
            </div>
          </Scaffold>
        </section>
      </PageLayout>
    );
  }

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
                href="/honor-court"
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
