'use client';

import { GrainOverlay } from '@/components/layout/grain-overlay';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Frameworks } from '@/components/sections/frameworks';
import { StatsStrip } from '@/components/sections/stats-strip';
import { NewsSection } from '@/components/sections/news-section';
import { Quote } from '@/components/sections/quote';
import { CTA } from '@/components/sections/cta';

export default function HomePage() {
  return (
    <div
      style={{
        backgroundColor: 'var(--canvas)',
        color: 'var(--timber-dark)',
        fontFamily: "'Space Mono', monospace",
        minHeight: '100vh',
        overflowX: 'hidden',
        lineHeight: 1.4,
      }}
    >
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <Hero />
        <Frameworks />
        <StatsStrip />
        <NewsSection />
        <Quote />
        <CTA />
        <Footer />
      </SkeletonGrid>
    </div>
  );
}
