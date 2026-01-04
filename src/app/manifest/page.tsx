'use client';

import { PageLayout, PageHeader } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

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
    <PageLayout>
      <PageHeader
        subtitle="// НАША МІСІЯ"
        title="МАНІФЕСТ"
      />

      {/* Main Quote */}
      <section className="section-lg" style={{ textAlign: 'center' }}>
        <Scaffold>
          <div className="col-span-10 col-start-2">
            <blockquote style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2 }}>
              «Велика війна навчила нас: замало бути правим — потрібно бути сильним. Ми гуртуємо мільйон вільних людей, щоб змусити політиків слухати громадян.»
            </blockquote>
          </div>
        </Scaffold>
      </section>

      {/* Intro Text */}
      <section className="section">
        <Scaffold>
          <div className="col-span-4">
            <span className="mono pill">ВСТУП</span>
            <h2 className="section-title" style={{ marginTop: '1rem' }}>ЧОМУ МИ ІСНУЄМО</h2>
          </div>
          <div className="col-span-8">
            <p style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
              Україна пережила революції, війни та випробування, але досі не має дієвого механізму
              впливу громадян на владу між виборами. Політики обіцяють перед виборами і забувають
              про обіцянки після.
            </p>
            <p style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
              Мережа Вільних Людей — це інструмент постійного політичного тиску. Ми об'єднуємо
              громадян, формуємо спільні вимоги та домагаємося їх виконання.
            </p>
            <p style={{ lineHeight: 1.8 }}>
              Наша перша мета — право на цивільну зброю для самозахисту. Але це лише початок.
              Ми створюємо інфраструктуру демократії, яка дозволить громадянам впливати на
              будь-які рішення влади.
            </p>
          </div>
        </Scaffold>
      </section>

      {/* Principles */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono pill pill--bronze">НАШІ ПРИНЦИПИ</span>
          </div>
          <div className="col-span-full" style={{ marginTop: '2rem' }}>
            <SectionCardGrid columns={3}>
              {principles.map((principle, i) => (
                <SectionCard
                  key={principle.num}
                  title={principle.title}
                  subtitle={`// ${principle.num}`}
                  variant={i % 2 === 0 ? 'default' : 'dark'}
                >
                  {principle.text}
                </SectionCard>
              ))}
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Call to Action */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ</h2>
            <p className="cta-desc" style={{ margin: '0 auto 2rem' }}>
              Станьте частиною Мережі сьогодні. Ваш голос — це наша сила.
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
