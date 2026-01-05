'use client';

import Link from 'next/link';
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function JoinPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ДОЛУЧИТИСЯ"
        title="ПРИЄДНАТИСЯ"
        description="Два формати участі: Спільнота та Орден."
      />

      <PageContent narrow>
        <p>
          Є два формати участі:
        </p>
      </PageContent>

      {/* Membership Options */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={2}>
              <SectionCard
                title="Спільнота (відкрита)"
                subtitle="// ФОРМАТ 1"
              >
                <p>
                  Для тих, хто хоче бути поруч, підтримувати, волонтерити, долучатись до подій і ініціатив.
                  Спільнота — це широка база взаємодопомоги та реальних зв'язків.
                </p>
              </SectionCard>
              <SectionCard
                title="Орден (ядро)"
                subtitle="// ФОРМАТ 2"
                variant="dark"
              >
                <p>
                  Для тих, хто готовий до дисципліни, місій, внутрішніх правил, відповідальності і служіння структурі.
                  Вступ — за запрошенням або через процедуру відбору. Це робиться не для "закритості", а для довіри та безпеки.
                </p>
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      <PageContent narrow>
        <p>
          Заповніть заявку — і ми запропонуємо найкращий формат участі.
        </p>
        <p className="text-bronze mt-4">
          Уже знаєте, що хочете?{' '}
          <Link href="/sign-up" className="underline hover:no-underline font-bold">
            Зареєструватися зараз
          </Link>
        </p>
      </PageContent>

      {/* CTAs */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/sign-up" variant="primary" size="lg">
                ЗАРЕЄСТРУВАТИСЯ
              </HeavyCta>
              <HeavyCta href="/join/procedure" variant="outline" size="lg">
                ПРОЦЕДУРА ВСТУПУ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
