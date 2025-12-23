'use client';

import { AnimatedCounter } from '@/components/ui/animated-counter';

const stats = [
  { value: 1014256, label: 'ГОЛОСІВ У ДІЇ', sublabel: 'ЗА ПРАВО НА ЗБРОЮ' },
  { value: 52, label: 'ПІДТРИМКА', sublabel: 'УКРАЇНЦІВ', suffix: '%' },
  { value: 2024, label: 'ЗАСНОВАНО', sublabel: 'РІК' },
  { value: 0, label: 'СТАТУС', sublabel: 'ЄДРПОУ 45854363', text: 'ГО' },
];

export function StatsStrip() {
  return (
    <div
      style={{
        gridColumn: '1 / 6',
        background: 'var(--timber-beam)',
        color: 'var(--grain)',
        padding: '60px 80px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '40px',
        clipPath: 'polygon(0 15%, 100% 0, 100% 85%, 0 100%)',
        margin: '20px 0 80px',
      }}
    >
      {stats.map((stat, index) => (
        <div key={index} style={{ textAlign: 'center' }}>
          <p className="label" style={{ color: 'var(--grain)', opacity: 0.7 }}>
            {stat.label}
          </p>
          <p
            className="syne"
            style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}
          >
            {stat.text ? (
              stat.text
            ) : (
              <>
                <AnimatedCounter end={stat.value} />
                {stat.suffix}
              </>
            )}
          </p>
          <p style={{ fontSize: '11px', opacity: 0.7 }}>{stat.sublabel}</p>
        </div>
      ))}
    </div>
  );
}
