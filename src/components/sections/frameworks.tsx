'use client';

const frameworks = [
  {
    num: '01',
    title: 'ГУРТУВАННЯ',
    desc: "Об'єднуємо 1,000,000 громадян у Мережу політичного впливу для формування колективної спроможності.",
  },
  {
    num: '02',
    title: 'ВИМОГИ',
    desc: 'Формуємо програмні вимоги до політиків шляхом прямого голосування кожного члена Мережі.',
  },
  {
    num: '03',
    title: 'КОНТРОЛЬ',
    desc: 'Наймаємо політиків на роботу та контролюємо виконання наших вимог через імперативний мандат.',
  },
];

export function Frameworks() {
  return (
    <div
      className="mobile-full"
      style={{
        gridColumn: '2 / 5',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px',
        background: 'var(--grid-line)',
        border: '1px solid var(--grid-line)',
        marginBottom: '80px',
      }}
    >
      {frameworks.map((item, i) => (
        <div key={item.num} className="card">
          {i === 0 && <div className="joint" style={{ top: '-6px', left: '-6px' }} />}
          {i === 2 && <div className="joint" style={{ top: '-6px', right: '-6px' }} />}
          <p className="label">НАПРЯМОК {item.num}</p>
          <span
            className="card-title syne"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              display: 'block',
              margin: '20px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {item.title}
          </span>
          <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
