import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

const timeline = [
  {
    date: 'БЕРЕЗЕНЬ 2024',
    title: 'Заснування',
    text: 'Ідея Мережі народилась як відповідь на потребу в дієвому інструменті політичного впливу.',
  },
  {
    date: 'КВІТЕНЬ 2024',
    title: 'Перші 100 членів',
    text: 'Запуск платформи та початок формування спільноти однодумців.',
  },
  {
    date: 'ЧЕРВЕНЬ 2024',
    title: '1000 членів',
    text: 'Досягнення першого серйозного рубежу та запуск системи голосування.',
  },
  {
    date: 'ВЕРЕСЕНЬ 2024',
    title: 'Офіційна реєстрація',
    text: 'Мережа отримала статус громадської організації (ЄДРПОУ 45854363).',
  },
  {
    date: 'ГРУДЕНЬ 2024',
    title: '4500+ членів',
    text: 'Прийняття Положення про праймеріз та підготовка до виборів.',
  },
];

const team = [
  {
    name: 'ЗАСНОВНИКИ',
    description: 'Ініціативна група громадян, які об\'єдналися для створення інструменту політичного впливу.',
  },
  {
    name: 'РАДА МЕРЕЖІ',
    description: 'Обраний орган, що координує діяльність та приймає оперативні рішення.',
  },
  {
    name: 'ЧЛЕНИ МЕРЕЖІ',
    description: 'Головний орган прийняття рішень. Кожен член має право голосу з усіх питань.',
  },
];

export default function AboutPage() {
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
          label="ЗНАЙОМСТВО"
          title="ПРО НАС"
          description="Мережа Вільних Людей — це громадянська організація політичного впливу, яка об'єднує українців для захисту спільних інтересів."
        />

        {/* Mission Section */}
        <div
          style={{
            gridColumn: '2 / 5',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: 'var(--grid-line)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          <div
            style={{
              background: 'var(--timber-dark)',
              color: 'var(--grain)',
              padding: '60px',
            }}
          >
            <p className="label" style={{ color: 'var(--accent)', marginBottom: '20px' }}>
              НАША МІСІЯ
            </p>
            <h2 className="syne" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
              Створити інфраструктуру демократії, де голос кожного громадянина має реальну вагу.
            </h2>
          </div>
          <div style={{ background: 'var(--canvas)', padding: '60px' }}>
            <p className="label" style={{ marginBottom: '20px' }}>НАША ВІЗІЯ</p>
            <p style={{ fontSize: '16px', lineHeight: 1.8 }}>
              Україна, де мільйон об&apos;єднаних громадян впливають на політичні рішення через
              прозорі демократичні механізми. Де право на самозахист є невід&apos;ємною частиною
              громадянських свобод.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <p className="label" style={{ marginBottom: '40px' }}>ЯК ЦЕ ПРАЦЮЄ</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '40px',
            }}
          >
            <div>
              <span
                className="syne"
                style={{
                  fontSize: '64px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: '20px',
                }}
              >
                01
              </span>
              <h3 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>
                ГУРТУВАННЯ
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>
                Об&apos;єднуємо 1,000,000 громадян у Мережу політичного впливу для формування
                колективної спроможності.
              </p>
            </div>
            <div>
              <span
                className="syne"
                style={{
                  fontSize: '64px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: '20px',
                }}
              >
                02
              </span>
              <h3 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>
                ВИМОГИ
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>
                Формуємо програмні вимоги до політиків шляхом прямого голосування кожного
                члена Мережі.
              </p>
            </div>
            <div>
              <span
                className="syne"
                style={{
                  fontSize: '64px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: '20px',
                }}
              >
                03
              </span>
              <h3 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>
                КОНТРОЛЬ
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>
                Наймаємо політиків на роботу та контролюємо виконання наших вимог через
                імперативний мандат.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <p className="label" style={{ marginBottom: '40px' }}>НАША ІСТОРІЯ</p>
          <div style={{ borderLeft: '2px solid var(--timber-dark)', paddingLeft: '40px' }}>
            {timeline.map((item, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  marginBottom: i === timeline.length - 1 ? 0 : '40px',
                  paddingBottom: i === timeline.length - 1 ? 0 : '40px',
                  borderBottom: i === timeline.length - 1 ? 'none' : '1px solid var(--grid-line)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-49px',
                    top: '0',
                    width: '16px',
                    height: '16px',
                    background: 'var(--accent)',
                    borderRadius: '50%',
                  }}
                />
                <span className="label" style={{ marginBottom: '10px', display: 'block' }}>
                  {item.date}
                </span>
                <h3 className="syne" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Structure */}
        <div
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <p className="label" style={{ marginBottom: '40px' }}>СТРУКТУРА</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'var(--grid-line)',
              border: '1px solid var(--grid-line)',
            }}
          >
            {team.map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--canvas)',
                  padding: '40px',
                }}
              >
                <h3 className="syne" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '15px' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Info */}
        <div
          style={{
            gridColumn: '2 / 5',
            padding: '40px',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          <p className="label" style={{ marginBottom: '20px' }}>ЮРИДИЧНА ІНФОРМАЦІЯ</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            <div>
              <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '5px' }}>НАЗВА</p>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>
                ГО «Мережа Вільних Людей»
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '5px' }}>ЄДРПОУ</p>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>45854363</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '5px' }}>РІК ЗАСНУВАННЯ</p>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>2024</p>
            </div>
          </div>
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
            ГОТОВІ ПРИЄДНАТИСЬ?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.7, marginBottom: '30px' }}>
            Станьте частиною руху за права громадян
          </p>
          <Link href="/sign-up" className="btn" style={{ padding: '20px 50px' }}>
            ВСТУПИТИ ДО МЕРЕЖІ →
          </Link>
        </div>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
