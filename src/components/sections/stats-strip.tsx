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
      className="
        col-span-full
        bg-timber-beam text-grain
        py-12 px-4
        sm:py-14 sm:px-8
        md:py-16 md:px-12
        lg:px-20
        grid grid-cols-2 gap-6
        sm:grid-cols-4 sm:gap-8
        md:flex md:justify-between md:items-center md:gap-10
        my-5 mb-12
        sm:mb-16
        md:mb-20
      "
      style={{
        clipPath: 'polygon(0 8%, 100% 0, 100% 92%, 0 100%)',
      }}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <p className="label text-grain/70 text-[10px] sm:text-xs">
            {stat.label}
          </p>
          <p className="font-syne font-extrabold leading-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            {stat.text ? (
              stat.text
            ) : (
              <>
                <AnimatedCounter end={stat.value} />
                {stat.suffix}
              </>
            )}
          </p>
          <p className="text-[9px] sm:text-[11px] text-grain/70">{stat.sublabel}</p>
        </div>
      ))}
    </div>
  );
}
