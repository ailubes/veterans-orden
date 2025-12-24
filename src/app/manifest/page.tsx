import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

const principles = [
  {
    num: '01',
    title: 'СИЛА В ЄДНОСТІ',
    text: 'Ми об\'єднуємо мільйон громадян, щоб наш голос було неможливо ігнорувати. Поодинці ми — прохачі. Разом — сила, з якою рахуються.',
  },
  {
    num: '02',
    title: 'ПРАВО НА САМОЗАХИСТ',
    text: 'Кожен громадянин має природне право захищати себе, свою родину та власність. Це право не дарується державою — воно належить нам від народження.',
  },
  {
    num: '03',
    title: 'ВІДПОВІДАЛЬНІСТЬ',
    text: 'Свобода невіддільна від відповідальності. Ми виступаємо за освічене, відповідальне володіння зброєю з належною підготовкою та контролем.',
  },
  {
    num: '04',
    title: 'ДЕМОКРАТИЧНИЙ КОНТРОЛЬ',
    text: 'Політики працюють на нас, а не навпаки. Через механізм імперативного мандату ми контролюємо виконання наших вимог.',
  },
  {
    num: '05',
    title: 'ПРОЗОРІСТЬ',
    text: 'Кожне рішення, кожен крок Мережі — публічний. Ми будуємо організацію, де довіра базується на відкритості.',
  },
  {
    num: '06',
    title: 'ДІЯ',
    text: 'Замало бути правим — потрібно бути сильним. Ми не чекаємо змін — ми їх створюємо через конкретні дії та політичний тиск.',
  },
];

export default function ManifestPage() {
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
          label="НАША МІСІЯ"
          title="МАНІФЕСТ"
        />

        {/* Main Quote */}
        <div
          style={{
            gridColumn: '2 / 5',
            padding: '80px 0',
            borderBottom: '1px solid var(--grid-line)',
            marginBottom: '80px',
            position: 'relative',
          }}
        >
          <div className="joint" style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }} />
          <blockquote
            className="syne"
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            «Велика війна навчила нас: замало бути правим — потрібно бути сильним. Ми гуртуємо мільйон вільних людей, щоб змусити політиків слухати громадян.»
          </blockquote>
        </div>

        {/* Intro Text */}
        <div
          style={{
            gridColumn: '2 / 5',
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '60px',
            marginBottom: '80px',
          }}
        >
          <div>
            <p className="label" style={{ marginBottom: '20px' }}>ВСТУП</p>
            <h2 className="syne" style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.1 }}>
              ЧОМУ МИ ІСНУЄМО
            </h2>
          </div>
          <div style={{ fontSize: '16px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '20px' }}>
              Україна пережила революції, війни та випробування, але досі не має дієвого механізму
              впливу громадян на владу між виборами. Політики обіцяють перед виборами і забувають
              про обіцянки після.
            </p>
            <p style={{ marginBottom: '20px' }}>
              Мережа Вільних Людей — це інструмент постійного політичного тиску. Ми об&apos;єднуємо
              громадян, формуємо спільні вимоги та домагаємося їх виконання.
            </p>
            <p>
              Наша перша мета — право на цивільну зброю для самозахисту. Але це лише початок.
              Ми створюємо інфраструктуру демократії, яка дозволить громадянам впливати на
              будь-які рішення влади.
            </p>
          </div>
        </div>

        {/* Principles */}
        <div
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <p className="label" style={{ marginBottom: '40px' }}>НАШІ ПРИНЦИПИ</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'var(--grid-line)',
              border: '1px solid var(--grid-line)',
            }}
          >
            {principles.map((principle, i) => (
              <div
                key={principle.num}
                style={{
                  background: i % 2 === 0 ? 'var(--canvas)' : 'var(--timber-dark)',
                  color: i % 2 === 0 ? 'var(--timber-dark)' : 'var(--grain)',
                  padding: '40px',
                  minHeight: '280px',
                }}
              >
                <span
                  className="syne"
                  style={{
                    fontSize: '48px',
                    fontWeight: 800,
                    opacity: 0.2,
                    display: 'block',
                    marginBottom: '20px',
                  }}
                >
                  {principle.num}
                </span>
                <h3
                  className="syne"
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '15px',
                  }}
                >
                  {principle.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>
                  {principle.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div
          style={{
            gridColumn: '2 / 5',
            background: 'var(--timber-dark)',
            color: 'var(--grain)',
            padding: '80px',
            marginBottom: '80px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <h2
            className="syne"
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              marginBottom: '30px',
              lineHeight: 1,
            }}
          >
            ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '40px', opacity: 0.8, maxWidth: '600px', margin: '0 auto 40px' }}>
            Станьте частиною Мережі сьогодні. Ваш голос — це наша сила.
          </p>
          <Link
            href="/sign-up"
            className="btn"
            style={{
              padding: '20px 50px',
              fontSize: '14px',
              background: 'var(--accent)',
            }}
          >
            ВСТУПИТИ ДО МЕРЕЖІ →
          </Link>
        </div>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
