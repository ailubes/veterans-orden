'use client';

interface PageHeaderProps {
  label: string;
  title: string;
  description?: string;
}

export function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <div
      style={{
        gridColumn: '2 / 5',
        padding: '80px 0 60px',
        borderBottom: '2px solid var(--timber-dark)',
        marginBottom: '60px',
      }}
    >
      <p className="label" style={{ marginBottom: '20px' }}>
        {label}
      </p>
      <h1
        className="syne"
        style={{
          fontSize: 'clamp(48px, 8vw, 80px)',
          textTransform: 'uppercase',
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          marginBottom: description ? '30px' : 0,
        }}
      >
        {title}
      </h1>
      {description && (
        <p style={{ fontSize: '18px', maxWidth: '600px', lineHeight: 1.6, opacity: 0.8 }}>
          {description}
        </p>
      )}
    </div>
  );
}
