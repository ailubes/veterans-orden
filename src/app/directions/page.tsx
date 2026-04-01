'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useLocale } from 'next-intl';

export default function DirectionsPage() {
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
                  { label: 'Programs' },
                ]}
              />
            </div>
          </Scaffold>
        </section>

        <PageHeader
          subtitle="// PROGRAM AREAS"
          title="WHAT WE DO"
          description="We focus on practical outcomes: stronger veterans, resilient communities, and trusted internal accountability."
        />

        <PageContent narrow>
          <p>
            Each program area has a concrete objective: veteran entrepreneurship, community coordination,
            rights protection, and long-term social adaptation.
          </p>
        </PageContent>

        <section className="section" style={{ background: 'var(--bg-elevated)' }}>
          <Scaffold>
            <div className="col-span-full" style={{ marginBottom: '3rem' }}>
              <span className="mono section-kicker">// AREA 01</span>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>BUSINESS INCUBATOR</h2>
              <p className="section-desc" style={{ marginBottom: '2rem' }}>
                We help veterans launch sustainable ventures and build economic independence.
              </p>
              <SectionCardGrid columns={3}>
                <SectionCard title="READY-MADE MODELS" subtitle="// STARTUPS" href="/directions" variant="dark">
                  Practical business models validated by real field experience.
                </SectionCard>
                <SectionCard title="FUNDING NAVIGATION" subtitle="// FINANCE" href="/directions" variant="dark">
                  Support with grants and financing applications.
                </SectionCard>
                <SectionCard title="INFRASTRUCTURE" subtitle="// LOCATIONS" href="/directions" variant="dark">
                  Support in finding facilities and land for launch.
                </SectionCard>
                <SectionCard title="TRAINING" subtitle="// SKILLS" href="/directions" variant="dark">
                  Applied learning for business creation and operations.
                </SectionCard>
                <SectionCard title="PARTNERSHIP SUPPORT" subtitle="// DELIVERY" href="/directions" variant="dark">
                  Ongoing guidance at key business growth milestones.
                </SectionCard>
              </SectionCardGrid>
            </div>

            <div className="col-span-full" style={{ marginBottom: '3rem' }}>
              <span className="mono section-kicker">// AREA 02</span>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>COMMUNITY BUILDING</h2>
              <p className="section-desc" style={{ marginBottom: '2rem' }}>
                Order is a brotherhood network: reciprocal support, coordinated action, and local chapters.
              </p>
              <SectionCardGrid columns={3}>
                <SectionCard title="COORDINATION" subtitle="// NETWORK" href="/commanderies" variant="dark">
                  A distributed chapter network in Ukraine and abroad with horizontal ties.
                </SectionCard>
                <SectionCard title="COMMUNICATION" subtitle="// ENGAGEMENT" href="/directions" variant="dark">
                  Internal channels, shared events, and member collaboration.
                </SectionCard>
                <SectionCard title="SOCIAL CAPITAL" subtitle="// SUPPORT" href="/directions" variant="dark">
                  Trusted connections that accelerate practical help and opportunities.
                </SectionCard>
              </SectionCardGrid>
            </div>

            <div className="col-span-full">
              <span className="mono section-kicker">// AREA 03</span>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>INTERNAL ORDER</h2>
              <p className="section-desc" style={{ marginBottom: '2rem' }}>
                A structured mechanism for ethics, accountability, and dispute resolution.
              </p>
              <SectionCardGrid columns={3}>
                <SectionCard title="HONOR COURT" subtitle="// GOVERNANCE" href="/honor-court" variant="dark">
                  Internal integrity and peer accountability.
                </SectionCard>
                <SectionCard title="NORMS" subtitle="// CODE" href="/documents" variant="dark">
                  Common standards for conduct and decision-making.
                </SectionCard>
                <SectionCard title="DISCIPLINE" subtitle="// TRUST" href="/about" variant="dark">
                  Discipline as the foundation for trust and real execution.
                </SectionCard>
              </SectionCardGrid>
            </div>
          </Scaffold>
        </section>

        <section className="section-lg cta-section-join">
          <Scaffold>
            <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
              <h2 className="cta-title">Ready to contribute?</h2>
              <p className="cta-desc">Join the community and choose the area where you can add real value.</p>
              <CtaGroup align="center">
                <HeavyCta href="/join" variant="primary" size="lg">JOIN</HeavyCta>
                <HeavyCta href="/help-request" variant="outline" size="lg">GET HELP</HeavyCta>
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
                Репутація, довіра, взаємні зобов'язання. Коли спільнота сильна — кожен член сильніший.
              </SectionCard>
            </SectionCardGrid>
          </div>

          {/* Direction 3 — Internal Order */}
          <div className="col-span-full">
            <span className="mono section-kicker">// НАПРЯМ 03</span>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>ВНУТРІШНІЙ ПОРЯДОК</h2>
            <p className="section-desc" style={{ marginBottom: '2rem' }}>
              Орден не може існувати без внутрішньої дисципліни. Почесний Суд та принципи самоврядування захищають від руйнування зсередини.
            </p>
            <SectionCardGrid columns={3}>
              <SectionCard
                title="ПОЧЕСНИЙ СУД"
                subtitle="// МЕХАНІЗМ"
                href="/honor-court"
                variant="dark"
              >
                Внутрішній інструмент вирішення конфліктів, захисту честі та балансу відповідальності.
              </SectionCard>
              <SectionCard
                title="КОДЕКС"
                subtitle="// ПРАВИЛА"
                href="/documents"
                variant="dark"
              >
                Чіткі правила поведінки, етики, взаємної поваги та служіння спільній справі.
              </SectionCard>
              <SectionCard
                title="ДИСЦИПЛІНА"
                subtitle="// СТІЙКІСТЬ"
                href="/about"
                variant="dark"
              >
                Дисципліна — це не обмеження, а здатність тримати лінію, коли складно. Вона формує довіру та результат.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* CTA */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">Готовий долучитись до справи?</h2>
            <p className="cta-desc">
              Обери напрям, в якому ти можеш дати найбільшу користь спільноті.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                ПРИЄДНАТИСЬ
              </HeavyCta>
              <HeavyCta href="/help-request" variant="outline" size="lg">
                ПОТРІБНА ДОПОМОГА
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
