'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

const faqs = [
  {
    question: 'Що таке Орден Ветеранів?',
    answer:
      'Орден Ветеранів — це громадська організація підтримки, дисципліни та дії для ветеранів та їхніх союзників. Ми створюємо структуру, де є спільнота, ядро Ордену та внутрішній порядок через Суд Честі.',
  },
  {
    question: 'Чи є Орден політичною партією?',
    answer:
      'Ні, Орден Ветеранів — це громадська організація, а не політична партія. Ми працюємо з конкретними потребами: захист прав, підтримка, адаптація, розвиток та громадянські ініціативи.',
  },
  {
    question: 'Хто може приєднатися до Ордену?',
    answer:
      'Є два формати участі: Спільнота (відкрита для всіх, хто хоче підтримувати та волонтерити) та Орден (ядро для тих, хто готовий до дисципліни та місій, вступ за запрошенням або через відбір).',
  },
  {
    question: 'Що таке Суд Честі?',
    answer:
      'Суд Честі — це внутрішній механізм для примирення сторін, оцінки дотримання Кодексу, захисту честі та дисциплінарних рішень. Він не підмінює державні органи, а зберігає братерство і порядок всередині організації.',
  },
  {
    question: 'Які напрями роботи Ордену?',
    answer:
      'Шість ключових напрямків: адаптація, правовий захист, психологічна підтримка, освіта та наставництво, громадянські кампанії, взаємодопомога.',
  },
  {
    question: 'Що таке Тріада управління?',
    answer:
      'Тріада управління складається з трьох компонентів: Президент (виконавча відповідальність), Віце-президент (операційна координація) та Колегія Мислителів (стратегія та ідеологія). Така структура запобігає залежності від однієї людини.',
  },
  {
    question: 'Чи потрібно платити за членство?',
    answer:
      'Членство у Спільноті є безкоштовним. Підтримка організації здійснюється на добровільних засадах. Ви можете допомогти фінансово, але це не є обов\'язковою умовою участі.',
  },
  {
    question: 'Як я можу підтримати Орден?',
    answer:
      'Є кілька способів: приєднатися до Спільноти або Ордену, зробити фінансовий внесок, стати партнером (для бізнесу та організацій), поширювати інформацію про нашу діяльність.',
  },
  {
    question: 'Чи захищені мої персональні дані?',
    answer:
      'Так, ми дотримуємося політики конфіденційності. Вся інформація зберігається безпечно, передача даних шифрується. Ми не передаємо ваші дані третім особам без вашої згоди.',
  },
  {
    question: 'Як зв\'язатися з Орденом Ветеранів?',
    answer:
      'Ви можете зв\'язатися з нами через електронну пошту info@veterans-orden.org або відвідати сторінку Контакти для детальної інформації.',
  },
];

export default function FAQPage() {
  return (
    <div
      style={{
        backgroundColor: 'var(--canvas)',
        color: 'var(--timber-dark)',
        fontFamily: "'Space Mono', monospace",
        minHeight: '100vh',
      }}
    >
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ВІДПОВІДІ НА ЗАПИТАННЯ"
          title="FAQ"
          description="Відповіді на найпоширеніші запитання про Орден Ветеранів."
        />

        {/* FAQ List */}
        <div
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                borderBottom: '1px solid var(--grid-line)',
                padding: '30px 0',
              }}
            >
              <h3
                className="syne"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '15px',
                }}
              >
                {faq.question}
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: 1.8,
                  opacity: 0.8,
                }}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            gridColumn: '2 / 5',
            textAlign: 'center',
            padding: '60px 0',
            borderTop: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          <h2 className="syne" style={{ fontSize: '36px', fontWeight: 700, marginBottom: '20px' }}>
            НЕ ЗНАЙШЛИ ВІДПОВІДІ?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.7, marginBottom: '30px' }}>
            Зв'яжіться з нами для отримання додаткової інформації
          </p>
          <Link href="/contacts" className="btn" style={{ padding: '20px 50px' }}>
            КОНТАКТИ →
          </Link>
        </div>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
