'use client';

import Link from 'next/link';
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

const contacts = [
  {
    type: 'EMAIL',
    value: 'info@freepeople.org.ua',
    href: 'mailto:info@freepeople.org.ua',
    description: 'Для загальних питань та пропозицій',
  },
  {
    type: 'ТЕЛЕФОН',
    value: '+38 097 782 6978',
    href: 'tel:+380977826978',
    description: 'Пн-Пт, 10:00-18:00',
  },
  {
    type: 'TELEGRAM',
    value: '@merezha_vilnyh',
    href: 'https://t.me/merezha_vilnyh',
    description: 'Офіційний канал Мережі',
  },
];

const socials = [
  {
    name: 'YouTube',
    handle: '@ZBROIOVYILOBIST',
    href: 'https://www.youtube.com/@ZBROIOVYILOBIST',
    description: 'Збройовий Лобіст — щотижневі випуски',
  },
  {
    name: 'Facebook',
    handle: 'Мережа Вільних Людей',
    href: 'https://www.facebook.com/freepeople.org.ua',
    description: 'Новини та обговорення',
  },
  {
    name: 'Instagram',
    handle: '@freepeople.ua',
    href: 'https://www.instagram.com/freepeople.ua',
    description: 'Візуальний контент та stories',
  },
];

export default function ContactsPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ЗВ'ЯЗОК"
        title="КОНТАКТИ"
        description="Маєте питання або пропозиції? Зв'яжіться з нами зручним для вас способом."
      />

      {/* Contact Cards */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              {contacts.map((contact) => (
                <a
                  key={contact.type}
                  href={contact.href}
                  className="section-card"
                >
                  <span className="mono pill">{contact.type}</span>
                  <h3 className="section-card__title" style={{ color: 'var(--bronze)' }}>
                    {contact.value}
                  </h3>
                  <p className="section-card__desc">{contact.description}</p>
                </a>
              ))}
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Address Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-6">
            <SectionCard
              title="Київська обл., Бучанський р-н, с. Петропавлівська Борщагівка"
              subtitle="// ЮРИДИЧНА АДРЕСА"
              variant="dark"
            >
              {null}
            </SectionCard>
          </div>
          <div className="col-span-6">
            <SectionCard
              title="Примітка"
              subtitle="// ОНЛАЙН-СПІЛЬНОТА"
            >
              <p>
                Мережа Вільних Людей — це передусім онлайн-спільнота. Ми працюємо
                дистанційно та проводимо регулярні офлайн-зустрічі у різних містах України.
              </p>
              <p style={{ opacity: 0.7, marginTop: '1rem', fontSize: '14px' }}>
                Для участі в офлайн-заходах слідкуйте за анонсами в наших соціальних мережах.
              </p>
            </SectionCard>
          </div>
        </Scaffold>
      </section>

      {/* Social Media */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <h2 className="section-title">СОЦІАЛЬНІ МЕРЕЖІ</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="section-card"
                >
                  <h3 className="section-card__title">{social.name}</h3>
                  <p style={{ color: 'var(--bronze)', marginBottom: '0.5rem' }}>
                    {social.handle}
                  </p>
                  <p className="section-card__desc">{social.description}</p>
                </a>
              ))}
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* FAQ Teaser */}
      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <span className="mono pill pill--bronze">ЧАСТІ ЗАПИТАННЯ</span>
            <h2 className="cta-title">Маєте питання про Мережу?</h2>
            <p className="cta-desc">
              Перегляньте відповіді на найпоширеніші запитання
            </p>
            <HeavyCta href="/faq" variant="outline">
              ПЕРЕГЛЯНУТИ FAQ
            </HeavyCta>
          </div>
        </Scaffold>
      </section>

      {/* Join CTA */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">ГОТОВІ ПРИЄДНАТИСЬ?</h2>
            <p className="cta-desc" style={{ margin: '0 auto 2rem' }}>
              Станьте частиною руху за права громадян
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/sign-up" variant="primary" size="lg">
                ВСТУПИТИ ДО МЕРЕЖІ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
