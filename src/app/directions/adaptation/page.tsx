'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useLocale } from 'next-intl';

const OTHER_DIRECTIONS_UK = [
  { slug: 'legal-protection', title: 'ПРАВОВИЙ ЗАХИСТ', desc: 'Консультації та захист прав' },
  { slug: 'psychological-support', title: 'ПСИХОЛОГІЧНА ПІДТРИМКА', desc: 'Скринінг та групи підтримки' },
  { slug: 'education', title: 'ОСВІТА & НАСТАВНИЦТВО', desc: 'Тренінги та розвиток' },
];

const OTHER_DIRECTIONS_EN = [
  { slug: 'legal-protection', title: 'LEGAL PROTECTION', desc: 'Consulting and rights protection' },
  { slug: 'psychological-support', title: 'PSYCHOLOGICAL SUPPORT', desc: 'Screening and support groups' },
  { slug: 'education', title: 'EDUCATION & MENTORING', desc: 'Training and development' },
];

export default function AdaptationPage() {
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
                  { label: 'Programs', href: '/directions' },
                  { label: 'Adaptation' },
                ]}
              />
            </div>
          </Scaffold>
        </section>

        <PageHeader
          subtitle="// PROGRAM"
          title="ADAPTATION"
          description="Support for transition to civilian life, mentorship, and trusted community connections."
        />

        <PageContent narrow>
          <p>
            Transitioning from military service to civilian life is not just a job change. It is a change of rhythm,
            environment, responsibilities, and meaning. We understand this from lived experience.
          </p>
          <p>
            We provide practical support: experienced mentors, a trusted network for day-to-day challenges, and
            guided help in the first months after demobilization.
          </p>
          <p>
            Our approach is veteran-to-veteran. We do not replace professional care, but we are the first line of
            support when you need someone who truly understands.
          </p>
        </PageContent>

        <section className="section" style={{ background: 'var(--bg-elevated)' }}>
          <Scaffold>
            <div className="col-span-full">
              <span className="mono section-kicker">// WHAT WE OFFER</span>
              <h2 className="section-title">Program Services</h2>
            </div>
            <div className="col-span-full">
              <SectionCardGrid columns={3}>
                <SectionCard title="MENTORSHIP" subtitle="// SERVICE" variant="dark">
                  Personal mentor support from veterans who have already completed this transition.
                  Regular check-ins and decision support.
                </SectionCard>
                <SectionCard title="COMMUNITY" subtitle="// SERVICE" variant="dark">
                  A practical support network for employment, housing, paperwork, and peer contacts.
                </SectionCard>
                <SectionCard title="GUIDED SUPPORT" subtitle="// SERVICE" variant="dark">
                  Structured support during the first 3-6 months after demobilization, including referrals.
                </SectionCard>
              </SectionCardGrid>
            </div>
          </Scaffold>
        </section>

        <section className="section">
          <Scaffold>
            <div className="col-span-full">
              <span className="mono section-kicker">// PROCESS</span>
              <h2 className="section-title">How It Works</h2>
            </div>
            <div className="col-span-8">
              <div className="page-content">
                <p><strong>Step 1: Intro session.</strong> We define your current needs and priorities.</p>
                <p><strong>Step 2: Mentor matching.</strong> We match you with a suitable mentor based on your profile.</p>
                <p><strong>Step 3: Personal plan.</strong> You build a practical transition plan with clear next steps.</p>
                <p><strong>Step 4: Ongoing support.</strong> You receive regular support and access to community resources.</p>
              </div>
            </div>
          </Scaffold>
        </section>

        <section className="section" style={{ background: 'var(--bg-elevated)' }}>
          <Scaffold>
            <div className="col-span-full">
              <span className="mono section-kicker">// OTHER PROGRAMS</span>
              <h2 className="section-title">Learn More</h2>
            </div>
            <div className="col-span-full">
              <SectionCardGrid columns={3}>
                {OTHER_DIRECTIONS_EN.map((dir) => (
                  <SectionCard
                    key={dir.slug}
                    title={dir.title}
                    subtitle="// PROGRAM"
                    href={`/directions/${dir.slug}`}
                    variant="dark"
                  >
                    {dir.desc}
                  </SectionCard>
                ))}
              </SectionCardGrid>
            </div>
          </Scaffold>
        </section>

        <section className="section-lg cta-section-join">
          <Scaffold>
            <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
              <h2 className="cta-title">Need adaptation support?</h2>
              <p className="cta-desc">Send a request and we will connect you with the right mentor.</p>
              <CtaGroup align="center">
                <HeavyCta href="/help-request" variant="primary" size="lg">
                  GET HELP
                </HeavyCta>
                <HeavyCta href="/join" variant="outline" size="lg">
                  JOIN
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
                { label: 'Напрями', href: '/directions' },
                { label: 'Адаптація' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// НАПРЯМ"
        title="АДАПТАЦІЯ"
        description="Підтримка переходу до цивільного життя, наставництво та спільнота контактів."
      />

      <PageContent narrow>
        <p>
          Перехід від військової служби до цивільного життя — це не просто зміна роботи.
          Це зміна всього: ритму, оточення, відповідальності, сенсу. Орден розуміє це, бо ми самі через це пройшли.
        </p>
        <p>
          Ми пропонуємо не абстрактні поради, а конкретну підтримку: досвідчений наставник, який вже адаптувався,
          спільнота контактів для вирішення побутових питань, супровід у перші місяці після демобілізації.
        </p>
        <p>
          Наш підхід — "побратим для побратима". Ми не замінюємо професійну допомогу, але ми є першою лінією підтримки,
          коли потрібно просто поговорити з тим, хто розуміє.
        </p>
      </PageContent>

      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ЩО МИ ПРОПОНУЄМО</span>
            <h2 className="section-title">Послуги напряму</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard title="НАСТАВНИЦТВО" subtitle="// ПОСЛУГА" variant="dark">
                Персональний досвідчений ментор — ветеран, який вже пройшов шлях адаптації та готовий ділитися досвідом.
                Регулярні зустрічі, підтримка у прийнятті рішень.
              </SectionCard>
              <SectionCard title="СПІЛЬНОТА" subtitle="// ПОСЛУГА" variant="dark">
                Мережа контактів для вирішення практичних питань: працевлаштування, житло, документи.
                Доступ до закритих чатів та подій Ордену.
              </SectionCard>
              <SectionCard title="СУПРОВІД" subtitle="// ПОСЛУГА" variant="dark">
                Допомога у перші 3-6 місяці після демобілізації: орієнтування у бюрократії, підтримка у кризових моментах,
                перенаправлення до спеціалістів.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ПРОЦЕС</span>
            <h2 className="section-title">Як це працює</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <p>
                <strong>Етап 1: Первинна консультація.</strong> Ми знайомимось, з'ясовуємо твої потреби та очікування.
                Розповідаємо, як працює система підтримки Ордену.
              </p>
              <p>
                <strong>Етап 2: Підбір наставника.</strong> На основі твого досвіду, інтересів та потреб підбираємо
                відповідного ментора з числа досвідчених членів Ордену.
              </p>
              <p>
                <strong>Етап 3: Індивідуальний план.</strong> Разом з наставником формуєте план адаптації:
                пріоритети, кроки, терміни. План гнучкий і адаптується під твої потреби.
              </p>
              <p>
                <strong>Етап 4: Регулярний супровід.</strong> Регулярні зустрічі з наставником,
                доступ до ресурсів спільноти, підтримка у вирішенні конкретних питань.
              </p>
            </div>
          </div>
        </Scaffold>
      </section>

      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ІНШІ НАПРЯМИ</span>
            <h2 className="section-title">Дізнатись більше</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              {OTHER_DIRECTIONS_UK.map((dir) => (
                <SectionCard
                  key={dir.slug}
                  title={dir.title}
                  subtitle="// НАПРЯМ"
                  href={`/directions/${dir.slug}`}
                  variant="dark"
                >
                  {dir.desc}
                </SectionCard>
              ))}
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">Потрібна підтримка в адаптації?</h2>
            <p className="cta-desc">
              Залиш заявку — ми зв'яжемось і допоможемо знайти наставника.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/help-request" variant="primary" size="lg">
                ОТРИМАТИ ДОПОМОГУ
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
