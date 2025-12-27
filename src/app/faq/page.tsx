import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

const faqs = [
  {
    question: 'Що таке Мережа Вільних Людей?',
    answer:
      'Мережа Вільних Людей — це громадянська організація політичного впливу, яка об\'єднує українців для захисту спільних інтересів. Наша головна мета — зібрати 1,000,000 членів, щоб мати реальний вплив на політичні рішення в Україні.',
  },
  {
    question: 'Яка головна мета Мережі?',
    answer:
      'Першочергова мета — ухвалення закону про цивільну зброю для самозахисту. Але це лише початок. Ми створюємо інфраструктуру демократії, яка дозволить громадянам впливати на будь-які рішення влади через механізм імперативного мандату.',
  },
  {
    question: 'Як стати членом Мережі?',
    answer:
      'Щоб стати членом Мережі, потрібно зареєструватися на нашому сайті та підтвердити свою особу. Членство є безкоштовним. Кожен член отримує право голосу з усіх питань діяльності організації.',
  },
  {
    question: 'Чи потрібно платити за членство?',
    answer:
      'Ні, членство в Мережі Вільних Людей є безкоштовним. Ми фінансуємося за рахунок добровільних внесків та пожертв. Ви можете підтримати нас фінансово, але це не є обов\'язковою умовою членства.',
  },
  {
    question: 'Що таке імперативний мандат?',
    answer:
      'Імперативний мандат — це механізм контролю виборців над обраними представниками. Політик, обраний за підтримки Мережі, зобов\'язується виконувати програмні вимоги членів. У разі невиконання — втрачає підтримку на наступних виборах.',
  },
  {
    question: 'Як працює голосування в Мережі?',
    answer:
      'Кожен член Мережі має один голос. Голосування проводиться онлайн через захищену платформу. Рішення приймаються простою більшістю голосів. Ви можете голосувати з будь-якого пристрою після авторизації.',
  },
  {
    question: 'Чи є Мережа політичною партією?',
    answer:
      'Ні, Мережа Вільних Людей — це громадська організація (ГО), а не політична партія. Ми не беремо участь у виборах як партія, але формуємо вимоги до політиків та підтримуємо тих, хто зобов\'язується їх виконувати.',
  },
  {
    question: 'Як я можу допомогти Мережі?',
    answer:
      'Є кілька способів допомогти: станьте членом та беріть участь у голосуваннях, запрошуйте друзів та знайомих, поширюйте інформацію в соціальних мережах, робіть добровільні внески, долучайтесь до волонтерської діяльності.',
  },
  {
    question: 'Чи захищені мої персональні дані?',
    answer:
      'Так, ми серйозно ставимося до захисту персональних даних. Вся інформація зберігається на захищених серверах, передача даних шифрується. Ми не передаємо ваші дані третім особам без вашої згоди.',
  },
  {
    question: 'Як зв\'язатися з Мережею?',
    answer:
      'Ви можете зв\'язатися з нами через електронну пошту info@freepeople.org.ua, телефон +38 097 782 6978, або через наші соціальні мережі. Також можете відвідати сторінку Контакти для детальної інформації.',
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
          description="Відповіді на найпоширеніші запитання про Мережу Вільних Людей."
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
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px',
                }}
              >
                <span style={{ color: 'var(--accent)', fontSize: '14px' }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {faq.question}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.8,
                  opacity: 0.8,
                  paddingLeft: '35px',
                }}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div
          style={{
            gridColumn: '2 / 5',
            padding: '60px',
            background: 'var(--timber-dark)',
            color: 'var(--grain)',
            marginBottom: '80px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <h2 className="syne" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '15px' }}>
            Не знайшли відповідь?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '30px' }}>
            Зв&apos;яжіться з нами напряму — ми завжди раді допомогти
          </p>
          <Link
            href="/contacts"
            className="btn"
            style={{ padding: '20px 40px', background: 'var(--accent)' }}
          >
            ЗВ&apos;ЯЗАТИСЯ З НАМИ
          </Link>
        </div>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
