'use client';

import Link from 'next/link';

export function CTA() {
  return (
    <div
      style={{
        gridColumn: '2 / 5',
        textAlign: 'center',
        padding: '60px 0 100px',
      }}
    >
      <p className="label" style={{ marginBottom: '20px' }}>
        ДОЛУЧАЙСЯ ДО ДІЇ
      </p>

      <h2
        className="syne"
        style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          marginBottom: '30px',
        }}
      >
        <span className="outline-text">БЕРИ УЧАСТЬ У ПЕРЕМОЗІ</span>
        <br />
        <span className="solid-text" style={{ color: 'var(--accent)' }}>
          УХВАЛИМО ЗАКОН
        </span>
        <br />
        <span className="solid-text">ПРО САМОЗАХИСТ</span>
      </h2>

      <p
        style={{
          maxWidth: '600px',
          margin: '0 auto 40px',
          fontSize: '16px',
          lineHeight: 1.6,
        }}
      >
        Кожен голос має значення: долучайся до Мережі, впливай на порядок денний і контролюй виконання вимог.
        Разом ми ухвалимо закон про зброю самозахисту.
      </p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/sign-up"
          className="btn"
          style={{ padding: '25px 50px', fontSize: '14px' }}
        >
          ДОЛУЧИТИСЬ ДО МЕРЕЖІ
        </Link>
      </div>

      <p
        style={{
          marginTop: '30px',
          fontSize: '11px',
          opacity: 0.5,
        }}
      >
        ГО «Мережа Вільних Людей», ЄДРПОУ 45854363
      </p>
    </div>
  );
}
