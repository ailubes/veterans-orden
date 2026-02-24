'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function DirectionsPage() {
  return (
    <PageLayout>
      {/* Breadcrumb */}
      <section className="section-sm">
        <Scaffold>
          <div className="col-span-full">
            <Breadcrumb
              items={[
                { label: 'Головна', href: '/' },
                { label: 'Напрями роботи' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// НАПРЯМИ РОБОТИ"
        title="ЩО МИ РОБИМО"
        description="Ми не займаємось імітацією бурхливої діяльності. Ми будуємо систему, яка працює на посилення ветеранів у цивільному житті. Наша робота ведеться за трьома основними напрямками."
      />

      <PageContent narrow>
        <p>
          Кожен напрям Ордену спрямований на конкретний результат: ветеран як власник справи, ветеран як частина згуртованої спільноти, ветеран у системі, що захищає його честь зсередини.
        </p>
      </PageContent>

      {/* 3 Directions */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          {/* Direction 1 — Business Incubator */}
          <div className="col-span-full" style={{ marginBottom: '3rem' }}>
            <span className="mono section-kicker">// НАПРЯМ 01</span>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>БІЗНЕС-ІНКУБАТОР</h2>
            <p className="section-desc" style={{ marginBottom: '2rem' }}>
              Головний напрям Ордену. Ми трансформуємо бойовий досвід у бізнес, відповідальність і економічну самостійність.
            </p>
            <SectionCardGrid columns={3}>
              <SectionCard
                title="БАНК ГОТОВИХ РІШЕНЬ"
                subtitle="// СТАРТАПИ"
                href="/directions"
                variant="dark"
              >
                Орден розробляє та пропонує життєздатні бізнес-моделі, перевірені реальним досвідом.
              </SectionCard>
              <SectionCard
                title="ФІНАНСОВА НАВІГАЦІЯ"
                subtitle="// ФІНАНСУВАННЯ"
                href="/directions"
                variant="dark"
              >
                Орден допоможе у пошуку грантів і підготовці заявок.
              </SectionCard>
              <SectionCard
                title="ІНФРАСТРУКТУРА"
                subtitle="// ЛОКАЦІЇ"
                href="/directions"
                variant="dark"
              >
                Орден допоможе з пошуком приміщень та землі для старту.
              </SectionCard>
              <SectionCard
                title="НАВЧАННЯ"
                subtitle="// ЗНАННЯ"
                href="/directions"
                variant="dark"
              >
                Орден проводить навчання та дає прикладні знання для створення та управління власним бізнесом.
              </SectionCard>
              <SectionCard
                title="ПАРТНЕРСЬКА ПІДТРИМКА"
                subtitle="// СУПРОВІД"
                href="/directions"
                variant="dark"
              >
                Підтримуємо на ключових етапах. Ми не няньки, але підставляємо плече, коли це справді потрібно.
              </SectionCard>
            </SectionCardGrid>
          </div>

          {/* Direction 2 — Community Building */}
          <div className="col-span-full" style={{ marginBottom: '3rem' }}>
            <span className="mono section-kicker">// НАПРЯМ 02</span>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>РОЗБУДОВА СПІЛЬНОТИ</h2>
            <p className="section-desc" style={{ marginBottom: '2rem' }}>
              Орден — це братерська мережа. Якщо ти готовий прийти на допомогу побратиму, побратими прийдуть на допомогу до тебе.
            </p>
            <SectionCardGrid columns={3}>
              <SectionCard
                title="КООРДИНАЦІЯ"
                subtitle="// МЕРЕЖА"
                href="/commanderies"
                variant="dark"
              >
                Розгалужена мережа осередків (командерій) по всій Україні та за кордоном. Горизонтальні зв'язки між членами.
              </SectionCard>
              <SectionCard
                title="КОМУНІКАЦІЯ"
                subtitle="// ВЗАЄМОДІЯ"
                href="/directions"
                variant="dark"
              >
                Внутрішні канали зв'язку, спільні події, навчання та взаємодія між членами спільноти.
              </SectionCard>
              <SectionCard
                title="СОЦІАЛЬНИЙ КАПІТАЛ"
                subtitle="// МЕРЕЖА ПІДТРИМКИ"
                href="/directions"
                variant="dark"
              >
                Орден підставляє плече у складних ситуаціях. Захист від свавілля, взаємна порука, братерська відповідальність.
              </SectionCard>
            </SectionCardGrid>
          </div>

          {/* Direction 3 — Internal Order */}
          <div className="col-span-full">
            <span className="mono section-kicker">// НАПРЯМ 03</span>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>ВНУТРІШНІЙ ПОРЯДОК</h2>
            <p className="section-desc" style={{ marginBottom: '2rem' }}>
              Порядок всередині — гарантія сили зовні. Орден живе за чіткими правилами, які захищають кожного члена.
            </p>
            <SectionCardGrid columns={3}>
              <SectionCard
                title="ЯДРО ОРДЕНУ"
                subtitle="// ДИСЦИПЛІНА"
                href="/join/procedure"
                variant="dark"
              >
                Дисципліноване ядро: ієрархія, кодекс, операційна дія. Вступ через запрошення, випробування та посвяту.
              </SectionCard>
              <SectionCard
                title="НАРАДА"
                subtitle="// ВНУТРІШНІЙ АРБІТРАЖ"
                href="/governance"
                variant="dark"
              >
                Внутрішній механізм вирішення спорів та захисту честі. Нарада утримує спільноту від руйнування зсередини та приймає стратегічні рішення.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* CTA Section */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">Потрібна допомога?</h2>
            <p className="cta-desc">
              Залиш заявку — ми відповімо та зорієнтуємо у потрібному напрямку.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/help-request" variant="primary" size="lg">
                ЗАЛИШИТИ ЗАЯВКУ
              </HeavyCta>
              <HeavyCta href="/join" variant="outline" size="lg">
                ПРИЄДНАТИСЯ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
