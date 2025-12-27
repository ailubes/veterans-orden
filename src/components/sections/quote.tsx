'use client';

export function Quote() {
  return (
    <div
      style={{
        gridColumn: '2 / 5',
        padding: '80px 0',
        borderTop: '1px solid var(--grid-line)',
        borderBottom: '1px solid var(--grid-line)',
        marginBottom: '80px',
        position: 'relative',
      }}
    >
      <div
        className="joint"
        style={{ top: '-3px', left: '50%', transform: 'translateX(-50%)' }}
      />

      <blockquote
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          className="syne"
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
          }}
        >
          &quot;Свободу не дають — її виборюють. Її захищають ті, хто готові діяти, а
          не чекати. Ми знаємо, що сила громади народжується з обов&apos;язку і
          відповідальності один перед одним.&quot;
        </p>
        <cite
          style={{
            display: 'block',
            marginTop: '30px',
            fontSize: '12px',
            fontStyle: 'normal',
            opacity: 0.6,
          }}
        >
          МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ
        </cite>
      </blockquote>
    </div>
  );
}
