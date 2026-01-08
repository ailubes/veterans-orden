'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const OTHER_DIRECTIONS = [
  { slug: 'adaptation', title: 'АДАПТАЦІЯ', desc: 'Наставництво та супровід' },
  { slug: 'legal-protection', title: 'ПРАВОВИЙ ЗАХИСТ', desc: 'Консультації та захист прав' },
  { slug: 'mutual-aid', title: 'ВЗАЄМОДОПОМОГА', desc: 'Підтримка побратимів' },
];

export default function PsychologicalSupportPage() {
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
                { label: 'Психологічна підтримка' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// НАПРЯМ"
        title="ПСИХОЛОГІЧНА ПІДТРИМКА"
        description="Скринінг, перенаправлення до фахівців, групи підтримки та кризові контакти."
      />

      <PageContent narrow>
        <p>
          Психологічне здоров'я — це не слабкість, це частина боєздатності. Орден розуміє, що бойовий досвід
          залишає сліди, і допомагає знайти правильний шлях до відновлення.
        </p>
        <p>
          Ми не є психологами — ми є першою лінією підтримки. Наша роль: вчасно помітити, що щось не так,
          допомогти подолати стигму звернення по допомогу, перенаправити до кваліфікованих спеціалістів.
        </p>
        <p>
          Групи підтримки — це простір, де можна поговорити з тими, хто розуміє без зайвих пояснень.
          Не терапія, а братерство.
        </p>
      </PageContent>

      {/* Services Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ЩО МИ ПРОПОНУЄМО</span>
            <h2 className="section-title">Послуги напряму</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="СКРИНІНГ"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Первинна оцінка стану та маршрутизація. Допомагаємо зрозуміти, яка саме допомога потрібна,
                і направляємо до відповідних спеціалістів.
              </SectionCard>
              <SectionCard
                title="ГРУПИ ПІДТРИМКИ"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Регулярні зустрічі у форматі peer-support. Спільнота однодумців, де можна поділитися досвідом
                та отримати підтримку без осуду.
              </SectionCard>
              <SectionCard
                title="КРИЗОВА ДОПОМОГА"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Контакти для екстрених ситуацій. Підтримка у складні моменти та швидке перенаправлення
                до кризових служб.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Important note */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ВАЖЛИВО</span>
            <h2 className="section-title">Наш підхід</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <p>
                <strong>Ми не замінюємо професійну допомогу.</strong> Орден — це не клініка і не психологічний центр.
                Наша роль — бути мостом між ветераном та професійною допомогою.
              </p>
              <p>
                <strong>Конфіденційність.</strong> Все, що обговорюється в групах підтримки та на консультаціях,
                залишається конфіденційним. Ми не передаємо інформацію третім особам.
              </p>
              <p>
                <strong>Без стигми.</strong> Звернення по допомогу — це не слабкість. Це крок до відновлення.
                В Ордені ніхто не буде осуджувати за те, що ти вирішив подбати про себе.
              </p>
              <p>
                <strong>Мережа партнерів.</strong> Ми співпрацюємо з перевіреними психологами, психотерапевтами
                та реабілітаційними центрами, які розуміють специфіку роботи з ветеранами.
              </p>
            </div>
          </div>
        </Scaffold>
      </section>

      {/* Other Directions */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ІНШІ НАПРЯМИ</span>
            <h2 className="section-title">Дізнатись більше</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              {OTHER_DIRECTIONS.map((dir) => (
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

      {/* CTA Section */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">Потрібна підтримка?</h2>
            <p className="cta-desc">
              Залиш заявку — ми зв'яжемось та допоможемо знайти правильний шлях.
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
