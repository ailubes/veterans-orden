'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function JoinProcedurePage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ПРОЦЕС ВСТУПУ"
        title="ЯК ПРИЄДНАТИСЯ"
        description="Два рівні участі: Спільнота та Орден."
      />

      <PageContent narrow>
        <p>
          Орден Ветеранів має два рівні участі: <strong>Спільнота</strong> (відкрита) та <strong>Орден</strong> (ядро). Це зроблено не для "закритості", а для <strong>довіри, безпеки і порядку</strong>.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={2}>
              <SectionCard
                title="Спільнота (відкрита)"
                subtitle="// ФОРМАТ 1"
              >
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Кому підходить:</strong> ветеранам, родинам, союзникам, волонтерам, партнерам.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Що дає:</strong> події, взаємодопомога, навчання, участь у ініціативах, мережа контактів.
                </p>
                <p>
                  <strong>Як вступити:</strong> подати заявку → короткий контакт/верифікація → підтвердження участі.
                </p>
              </SectionCard>
              <SectionCard
                title="Орден (ядро)"
                subtitle="// ФОРМАТ 2"
                variant="dark"
              >
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Кому підходить:</strong> тим, хто готовий до дисципліни, задач, відповідальності, місій, внутрішніх правил.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Що дає:</strong> глибша участь, вплив на процеси, доступ до робочих команд і місій, роль у побудові структури.
                </p>
                <p>
                  <strong>Як вступити:</strong> запит/рекомендація → співбесіда → період випробування → посвята.
                </p>
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      <PageContent narrow>
        <p style={{ padding: '1.5rem', background: 'var(--bg-elevated)', border: '2px solid var(--border-color)' }}>
          <strong>Важливо:</strong> Ми бережемо довіру. Тому процедура не формальність, а механізм захисту спільноти.
        </p>
      </PageContent>

      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">ГОТОВІ ДОЛУЧИТИСЬ?</h2>
            <p className="cta-desc" style={{ margin: '0 auto 2rem' }}>
              Заповніть заявку — і ми запропонуємо найкращий формат участі
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                ПОДАТИ ЗАЯВКУ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
