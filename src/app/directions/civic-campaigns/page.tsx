'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const OTHER_DIRECTIONS = [
  { slug: 'legal-protection', title: 'ПРАВОВИЙ ЗАХИСТ', desc: 'Консультації та захист прав' },
  { slug: 'education', title: 'ОСВІТА & НАСТАВНИЦТВО', desc: 'Тренінги та розвиток' },
  { slug: 'mutual-aid', title: 'ВЗАЄМОДОПОМОГА', desc: 'Підтримка побратимів' },
];

export default function CivicCampaignsPage() {
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
                { label: 'Громадянські кампанії' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// НАПРЯМ"
        title="ГРОМАДЯНСЬКІ КАМПАНІЇ"
        description="Адвокація, публічні звернення, комунікаційні кампанії та контроль виконання рішень."
      />

      <PageContent narrow>
        <p>
          Ветерани — це не тільки отримувачі допомоги, а й активні громадяни, які мають право голосу.
          Орден допомагає цей голос почути: через адвокацію, публічні кампанії та контроль влади.
        </p>
        <p>
          Ми працюємо над законодавчими ініціативами, що стосуються прав ветеранів, моніторимо виконання
          державних програм, формуємо публічну позицію з важливих питань.
        </p>
        <p>
          Наша мета — системні зміни, а не разові акції. Ми будуємо коаліції, працюємо з експертами
          та використовуємо всі легальні інструменти впливу на державну політику.
        </p>
      </PageContent>

      {/* Services Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ЩО МИ РОБИМО</span>
            <h2 className="section-title">Напрямки роботи</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="АДВОКАЦІЯ"
                subtitle="// НАПРЯМ"
                variant="dark"
              >
                Просування інтересів ветеранів на рівні державної політики.
                Робота з законодавцями, участь у робочих групах, експертні висновки.
              </SectionCard>
              <SectionCard
                title="КАМПАНІЇ"
                subtitle="// НАПРЯМ"
                variant="dark"
              >
                Інформаційні та комунікаційні проєкти. Підвищення обізнаності суспільства
                про проблеми та потреби ветеранів.
              </SectionCard>
              <SectionCard
                title="КОНТРОЛЬ"
                subtitle="// НАПРЯМ"
                variant="dark"
              >
                Моніторинг виконання державних програм та зобов'язань.
                Публічні звіти та вимоги до відповідальності.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Our approach */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// НАШ ПІДХІД</span>
            <h2 className="section-title">Принципи адвокації</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <p>
                <strong>Факти, не емоції.</strong> Наші кампанії базуються на даних, дослідженнях та конкретних прикладах.
                Ми не маніпулюємо — ми аргументуємо.
              </p>
              <p>
                <strong>Законність.</strong> Всі наші дії в межах закону. Ми використовуємо легальні інструменти впливу:
                звернення, петиції, публічні заяви, робота з медіа.
              </p>
              <p>
                <strong>Коаліції.</strong> Ми не працюємо на самоті. Об'єднуємось з іншими ветеранськими організаціями,
                експертами, громадськими активістами для досягнення спільних цілей.
              </p>
              <p>
                <strong>Прозорість.</strong> Наші позиції, вимоги та результати публічні.
                Ми звітуємо про свою роботу та відповідаємо за свої слова.
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
            <h2 className="cta-title">Хочеш долучитися?</h2>
            <p className="cta-desc">
              Приєднуйся до Ордену та допомагай змінювати систему зсередини.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                ПРИЄДНАТИСЯ
              </HeavyCta>
              <HeavyCta href="/news" variant="outline" size="lg">
                НОВИНИ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
