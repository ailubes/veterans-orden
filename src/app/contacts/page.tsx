'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

const contacts = [
  {
    type: 'EMAIL',
    value: 'info@veterans-orden.org',
    href: 'mailto:info@veterans-orden.org',
    description: 'Для загальних питань та пропозицій',
  },
  {
    type: 'TELEGRAM',
    value: '@orden_veteraniv',
    href: 'https://t.me/orden_veteraniv',
    description: 'Офіційний канал Ордену',
  },
];

export default function ContactsPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ЗВ'ЯЗОК"
        title="КОНТАКТИ"
        description="Напишіть нам — і ми відповімо."
      />

      <PageContent narrow>
        <p>
          Тут можна звернутися щодо:
        </p>

        <ul>
          <li>участі в Спільноті або Ордені,</li>
          <li>запиту допомоги,</li>
          <li>партнерства,</li>
          <li>медіа-запитів,</li>
          <li>пропозицій проєктів.</li>
        </ul>

        <p>
          Ми цінуємо чіткі звернення: коротко опишіть, хто ви, що потрібно і як з вами зв'язатися.
        </p>
      </PageContent>

      {/* Contact Cards */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={2}>
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

      {/* FAQ Teaser */}
      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Маєте питання про Орден?</h2>
            <p className="cta-desc">
              Перегляньте відповіді на найпоширеніші запитання
            </p>
            <CtaGroup>
              <HeavyCta href="/faq" variant="outline">
                ПЕРЕГЛЯНУТИ FAQ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      {/* Join CTA */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">ГОТОВІ ПРИЄДНАТИСЬ?</h2>
            <p className="cta-desc" style={{ margin: '0 auto 2rem' }}>
              Станьте частиною братерства честі та дії
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                ПРИЄДНАТИСЯ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
