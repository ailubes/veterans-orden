'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const OTHER_DIRECTIONS = [
  { slug: 'adaptation', title: 'АДАПТАЦІЯ', desc: 'Наставництво та супровід' },
  { slug: 'civic-campaigns', title: 'ГРОМАДЯНСЬКІ КАМПАНІЇ', desc: 'Адвокація та кампанії' },
  { slug: 'mutual-aid', title: 'ВЗАЄМОДОПОМОГА', desc: 'Підтримка побратимів' },
];

export default function EducationPage() {
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
                { label: 'Освіта & Наставництво' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// НАПРЯМ"
        title="ОСВІТА & НАСТАВНИЦТВО"
        description="Навчальні події, тренінги, розвиток лідерів та робота 'мислителів'."
      />

      <PageContent narrow>
        <p>
          Військовий досвід — це унікальна школа лідерства, дисципліни та роботи в команді.
          Орден допомагає трансформувати цей досвід у цивільні навички та кар'єрні можливості.
        </p>
        <p>
          Ми організовуємо тренінги, воркшопи та навчальні програми, які допомагають ветеранам
          адаптувати свої компетенції до цивільного ринку праці та розвивати нові навички.
        </p>
        <p>
          "Мислителі" Ордену — це група досвідчених членів, які працюють над стратегічними питаннями,
          діляться експертизою та допомагають формувати бачення організації.
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
                title="ТРЕНІНГИ"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Практичні навчальні програми: soft skills, комунікація, управління проєктами,
                підприємництво, цифрова грамотність.
              </SectionCard>
              <SectionCard
                title="ЛІДЕРСТВО"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Програми розвитку лідерів. Трансформація військового досвіду командування
                у цивільні лідерські компетенції.
              </SectionCard>
              <SectionCard
                title="КАР'ЄРА"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Допомога у працевлаштуванні: складання резюме, підготовка до співбесід,
                нетворкінг, зв'язки з роботодавцями.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Programs */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ПРОГРАМИ</span>
            <h2 className="section-title">Напрямки навчання</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <p>
                <strong>Лідерські програми.</strong> Розвиток управлінських навичок, стратегічне мислення,
                робота з командою, прийняття рішень в умовах невизначеності.
              </p>
              <p>
                <strong>Професійна перекваліфікація.</strong> Партнерства з навчальними закладами та компаніями
                для отримання нових професій та сертифікацій.
              </p>
              <p>
                <strong>Soft skills.</strong> Комунікація, переговори, презентації, конфліктологія,
                емоційний інтелект — навички, затребувані на цивільному ринку.
              </p>
              <p>
                <strong>Підприємництво.</strong> Для тих, хто хоче почати власну справу: основи бізнесу,
                бізнес-планування, фінанси, маркетинг, юридичні аспекти.
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
            <h2 className="cta-title">Хочеш розвиватися?</h2>
            <p className="cta-desc">
              Дізнайся про найближчі навчальні події або залиш заявку на консультацію.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/help-request" variant="primary" size="lg">
                ДІЗНАТИСЯ БІЛЬШЕ
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
