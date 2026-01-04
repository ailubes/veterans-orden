'use client';

import { useTranslations } from 'next-intl';
import { PageWrapper, Scaffold } from '@/components/layout/skeleton-grid';
import { NavigationNew } from '@/components/layout/navigation-new';
import { FooterNew } from '@/components/layout/footer-new';
import { HeroNew } from '@/components/sections/hero-new';
import { StatsSection } from '@/components/sections/stats-section';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

/**
 * Homepage - Redesigned with new component system
 *
 * Features:
 * - Dual theme support (light/dark)
 * - Full i18n (UA/EN)
 * - New 12-column scaffold grid
 * - Monolith card hero
 * - Theme-aware styling
 */
export default function HomePage() {
  const tAbout = useTranslations('about');
  const tDirections = useTranslations('directions');
  const tJoin = useTranslations('join');
  const tSupport = useTranslations('support');
  const tHelp = useTranslations('help');

  return (
    <PageWrapper>
      <NavigationNew />

      {/* Hero Section */}
      <HeroNew />

      {/* Stats Section */}
      <StatsSection veterans={1247} regions={25} programs={12} />

      {/* About Section */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <h2 className="section-title">{tAbout('sectionTitle')}</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title={tAbout('community.title')}
                subtitle="// 01"
                href="/about"
              >
                {tAbout('community.desc')}
              </SectionCard>
              <SectionCard
                title={tAbout('order.title')}
                subtitle="// 02"
                href="/code-of-honor"
              >
                {tAbout('order.desc')}
              </SectionCard>
              <SectionCard
                title={tAbout('honorCourt.title')}
                subtitle="// 03"
                href="/governance"
              >
                {tAbout('honorCourt.desc')}
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Directions Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <h2 className="section-title">{tDirections('sectionTitle')}</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title={tDirections('advocacy.title')}
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                {tDirections('advocacy.desc')}
              </SectionCard>
              <SectionCard
                title={tDirections('adaptation.title')}
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                {tDirections('adaptation.desc')}
              </SectionCard>
              <SectionCard
                title={tDirections('brotherhood.title')}
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                {tDirections('brotherhood.desc')}
              </SectionCard>
              <SectionCard
                title={tDirections('development.title')}
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                {tDirections('development.desc')}
              </SectionCard>
              <SectionCard
                title={tDirections('health.title')}
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                {tDirections('health.desc')}
              </SectionCard>
              <SectionCard
                title={tDirections('families.title')}
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                {tDirections('families.desc')}
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Join CTA Section */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">{tJoin('sectionTitle')}</h2>
            <p className="cta-desc" style={{ margin: '0 auto 2rem' }}>{tJoin('desc')}</p>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                {tJoin('cta')}
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      {/* Support CTA Section */}
      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-6">
            <h2 className="cta-title">{tSupport('sectionTitle')}</h2>
            <p className="cta-desc">{tSupport('desc')}</p>
            <HeavyCta href="/support" variant="secondary" size="lg">
              {tSupport('cta')}
            </HeavyCta>
          </div>
        </Scaffold>
      </section>

      {/* Help CTA Section */}
      <section className="section cta-section-help">
        <Scaffold>
          <div className="col-span-6 col-start-7">
            <h2 className="cta-title">{tHelp('sectionTitle')}</h2>
            <p className="cta-desc">{tHelp('desc')}</p>
            <HeavyCta href="/help" variant="outline" size="lg">
              {tHelp('cta')}
            </HeavyCta>
          </div>
        </Scaffold>
      </section>

      <FooterNew />
    </PageWrapper>
  );
}
