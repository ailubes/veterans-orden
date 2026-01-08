'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const OTHER_DIRECTIONS = [
  { slug: 'adaptation', title: 'АДАПТАЦІЯ', desc: 'Наставництво та супровід' },
  { slug: 'psychological-support', title: 'ПСИХОЛОГІЧНА ПІДТРИМКА', desc: 'Скринінг та групи підтримки' },
  { slug: 'education', title: 'ОСВІТА & НАСТАВНИЦТВО', desc: 'Тренінги та розвиток' },
];

export default function LegalProtectionPage() {
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
                { label: 'Правовий захист' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// НАПРЯМ"
        title="ПРАВОВИЙ ЗАХИСТ"
        description="Консультації, супровід кейсів та захист прав ветеранів і їхніх родин."
      />

      <PageContent narrow>
        <p>
          Ветерани та їхні родини часто стикаються з бюрократичними перешкодами: затримки виплат, проблеми з документами,
          порушення прав на робочому місці, житлові питання. Орден допомагає розібратися в цьому хаосі.
        </p>
        <p>
          Ми не замінюємо адвокатів — ми допомагаємо зрозуміти свої права, підготувати звернення,
          знайти правильний шлях вирішення проблеми. У складних випадках — перенаправляємо до перевірених юристів.
        </p>
        <p>
          Наш принцип: знання — сила. Чим більше ветеран знає про свої права, тим менше шансів,
          що його права будуть порушені.
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
                title="КОНСУЛЬТАЦІЇ"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Безкоштовні юридичні консультації з питань соціального захисту, пільг, трудового права.
                Допомога у розумінні законодавства та своїх прав.
              </SectionCard>
              <SectionCard
                title="СУПРОВІД КЕЙСІВ"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Повний супровід складних справ: підготовка документів, контроль термінів,
                комунікація з державними органами.
              </SectionCard>
              <SectionCard
                title="ЗАХИСТ ПРАВ"
                subtitle="// ПОСЛУГА"
                variant="dark"
              >
                Представництво інтересів ветеранів перед державними органами.
                Допомога у випадках порушення прав.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Areas of help */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// НАПРЯМКИ ДОПОМОГИ</span>
            <h2 className="section-title">З чим допомагаємо</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <ul>
                <li><strong>Соціальні виплати та пільги</strong> — оформлення, перерахунок, оскарження відмов</li>
                <li><strong>Житлові питання</strong> — черги на житло, субсидії, оренда</li>
                <li><strong>Медичне забезпечення</strong> — реабілітація, протезування, ліки</li>
                <li><strong>Працевлаштування</strong> — права працівника, дискримінація, звільнення</li>
                <li><strong>Сімейне право</strong> — аліменти, опіка, майнові питання</li>
                <li><strong>Статус УБД</strong> — оформлення, підтвердження, поновлення документів</li>
              </ul>
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
            <h2 className="cta-title">Потрібна правова допомога?</h2>
            <p className="cta-desc">
              Залиш заявку — ми проконсультуємо та допоможемо знайти рішення.
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
