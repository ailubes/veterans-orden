'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const OTHER_DIRECTIONS = [
  { slug: 'adaptation', title: 'АДАПТАЦІЯ', desc: 'Наставництво та супровід' },
  { slug: 'psychological-support', title: 'ПСИХОЛОГІЧНА ПІДТРИМКА', desc: 'Скринінг та групи підтримки' },
  { slug: 'civic-campaigns', title: 'ГРОМАДЯНСЬКІ КАМПАНІЇ', desc: 'Адвокація та кампанії' },
];

export default function MutualAidPage() {
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
                { label: 'Взаємодопомога' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// НАПРЯМ"
        title="ВЗАЄМОДОПОМОГА"
        description="Підтримка побратимів, волонтерські місії, координація ресурсів та партнерства."
      />

      <PageContent narrow>
        <p>
          Взаємодопомога — це серце Ордену. Ми не чекаємо, поки держава чи благодійники вирішать наші проблеми.
          Ми допомагаємо одне одному напряму: ресурсами, контактами, часом, досвідом.
        </p>
        <p>
          Коли побратим потребує допомоги — Орден мобілізується. Це може бути все: від допомоги з переїздом
          до збору коштів на лікування, від пошуку роботи до простої розмови в складний момент.
        </p>
        <p>
          Ми також координуємо волонтерські місії: допомога діючим підрозділам, підтримка родин загиблих,
          участь у громадських ініціативах. Бути членом Ордену — означає бути готовим допомогти.
        </p>
      </PageContent>

      {/* Services Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ЩО МИ РОБИМО</span>
            <h2 className="section-title">Форми допомоги</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="ПІДТРИМКА"
                subtitle="// ФОРМА"
                variant="dark"
              >
                Пряма допомога ветеранам та їхнім родинам: матеріальна, організаційна, інформаційна.
                Від допомоги з ремонтом до супроводу в лікарню.
              </SectionCard>
              <SectionCard
                title="ВОЛОНТЕРСТВО"
                subtitle="// ФОРМА"
                variant="dark"
              >
                Участь у місіях та проєктах: допомога діючим підрозділам, підтримка госпіталів,
                робота з родинами загиблих, громадські ініціативи.
              </SectionCard>
              <SectionCard
                title="ПАРТНЕРСТВА"
                subtitle="// ФОРМА"
                variant="dark"
              >
                Співпраця з іншими організаціями, бізнесом та державними установами
                для розширення можливостей допомоги.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* How it works */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ПРИНЦИПИ</span>
            <h2 className="section-title">Як працює взаємодопомога</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <p>
                <strong>Побратим для побратима.</strong> Допомога йде напряму, без бюрократії та посередників.
                Коли хтось потребує — ті, хто може, відгукуються.
              </p>
              <p>
                <strong>Координація.</strong> Орден координує запити та ресурси, щоб допомога була ефективною.
                Ми знаємо, хто що вміє і хто чим може допомогти.
              </p>
              <p>
                <strong>Взаємність.</strong> Сьогодні ти допомагаєш, завтра — тобі. Це не благодійність,
                це братерство. Кожен член Ордену і отримує, і дає.
              </p>
              <p>
                <strong>Межі.</strong> Ми допомагаємо в рамках можливостей. Якщо запит виходить за наші компетенції —
                перенаправляємо до тих, хто може допомогти краще.
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
            <h2 className="cta-title">Хочеш бути частиною?</h2>
            <p className="cta-desc">
              Приєднуйся до Ордену — давай і отримуй підтримку братерства.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                ПРИЄДНАТИСЯ
              </HeavyCta>
              <HeavyCta href="/help-request" variant="outline" size="lg">
                ОТРИМАТИ ДОПОМОГУ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
