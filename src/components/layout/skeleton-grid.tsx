'use client';

interface SkeletonGridProps {
  children: React.ReactNode;
}

export function SkeletonGrid({ children }: SkeletonGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 1fr 80px',
        minHeight: '100vh',
        borderLeft: '1px solid var(--grid-line)',
        borderRight: '1px solid var(--grid-line)',
        margin: '0 auto',
        maxWidth: '1600px',
        position: 'relative',
      }}
    >
      {/* Structural Beams */}
      <div className="beam-v" style={{ left: '80px' }} />
      <div className="beam-v" style={{ right: '80px' }} />
      <div className="beam-v" style={{ left: '50%', opacity: 0.5 }} />

      {children}
    </div>
  );
}
