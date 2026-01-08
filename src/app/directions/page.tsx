'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const DIRECTIONS = [
  {
    slug: 'adaptation',
    title: 'АДАПТАЦІЯ',
    description: 'Підтримка переходу до цивільного життя, наставництво, спільнота контактів, супровід.',
  },
  {
    slug: 'legal-protection',
    title: 'ПРАВОВИЙ ЗАХИСТ',
    description: 'Консультації, звернення, супровід кейсів, захист прав ветеранів і родин.',
  },
  {
    slug: 'psychological-support',
    title: 'ПСИХОЛОГІЧНА ПІДТРИМКА',
    description: 'Скринінг, перенаправлення до фахівців, групи підтримки, кризові контакти.',
  },
  {
    slug: 'education',
    title: 'ОСВІТА & НАСТАВНИЦТВО',
    description: 'Навчальні події, тренінги, розвиток лідерів, робота "мислителів".',
  },
  {
    slug: 'civic-campaigns',
    title: 'ГРОМАДЯНСЬКІ КАМПАНІЇ',
    description: 'Адвокація, публічні звернення, комунікаційні кампанії, контроль виконання рішень.',
  },
  {
    slug: 'mutual-aid',
    title: 'ВЗАЄМОДОПОМОГА',
    description: 'Підтримка побратимів, волонтерські місії, координація ресурсів, партнерства.',
  },
];

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
        description="Орден Ветеранів працює у шести ключових напрямках: адаптація, правовий захист, психологічна підтримка, освіта, громадянські кампанії та взаємодопомога."
      />

      <PageContent narrow>
        <p>
          Кожен напрям роботи Ордену спрямований на конкретну підтримку ветеранів, їхніх родин та спільноти.
          Ми не обіцяємо всього — ми робимо те, що можемо зробити якісно.
        </p>
        <p>
          Наша система побудована на принципах взаємодопомоги, чіткої відповідальності та прозорості.
          Кожен напрям має координаторів, процедури та критерії якості.
        </p>
      </PageContent>

      {/* Directions Grid */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              {DIRECTIONS.map((direction) => (
                <SectionCard
                  key={direction.slug}
                  title={direction.title}
                  subtitle="// НАПРЯМ"
                  href={`/directions/${direction.slug}`}
                  variant="dark"
                >
                  {direction.description}
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
