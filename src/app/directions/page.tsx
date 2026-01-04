'use client';

import { PageLayout, PageHeader } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

const programs = [
  {
    title: 'Адаптація',
    description: 'Ми допомагаємо ветеранам пройти шлях повернення до цивільного життя без хаосу: навігація, супровід, підказки, контакти, підтримка побратимів, наставництво. Адаптація — це не "порада", це маршрут.'
  },
  {
    title: 'Правовий захист',
    description: 'Звернення, консультації, супровід кейсів, захист прав ветеранів та їхніх родин. Ми працюємо з тим, щоб людина не відчувала себе безсилою перед бюрократією.'
  },
  {
    title: 'Психологічна підтримка',
    description: 'Ми не "лікуємо замість лікарів". Але ми робимо важливе: створюємо безпечний шлях до фахівця, груп підтримки або партнерських сервісів. Психологічна допомога — це частина відновлення, а не "слабкість".'
  },
  {
    title: 'Освіта та наставництво',
    description: 'Події, практичні тренінги, розвиток лідерів, обмін досвідом. Ветеранський потенціал має перетворюватися на компетенції, проєкти, роботу й вплив.'
  },
  {
    title: 'Громадянські кампанії',
    description: 'Коли проблема системна — потрібна системна дія. Ми запускаємо ініціативи, які захищають права і змінюють правила гри. Кампанії — це дисциплінована послідовність, а не емоційний спалах.'
  },
  {
    title: 'Взаємодопомога',
    description: 'Орден — це про "поруч є свої". Підтримка в складних ситуаціях, координація ресурсів, волонтерські місії, допомога родинам, включення в мережу людей, які реально роблять.'
  },
];

export default function DirectionsPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ЩО МИ РОБИМО"
        title="НАПРЯМИ"
        description="Шість ключових напрямків роботи Ордену Ветеранів."
      />

      {/* Programs Grid */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={2}>
              {programs.map((program, index) => (
                <SectionCard
                  key={index}
                  title={program.title}
                  subtitle={`// НАПРЯМ ${index + 1}`}
                  variant={index === 0 || index === 5 ? 'dark' : 'default'}
                >
                  {program.description}
                </SectionCard>
              ))}
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Join CTA */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">ГОТОВІ ДОЛУЧИТИСЬ?</h2>
            <p className="cta-desc" style={{ margin: '0 auto 2rem' }}>
              Станьте частиною команди, яка діє
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
