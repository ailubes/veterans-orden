'use client';

interface SkeletonGridProps {
  children: React.ReactNode;
}

export function SkeletonGrid({ children }: SkeletonGridProps) {
  return (
    <div className="skeleton-container">
      {/* Structural Beams - hidden on mobile via CSS */}
      <div className="beam-v beam-left" />
      <div className="beam-v beam-right" />
      <div className="beam-v beam-center" />

      {children}
    </div>
  );
}
