'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { MonolithCard, MonolithCardActions } from '@/components/ui/monolith-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Pill } from '@/components/ui/pill';
import { ContentAdapter } from '@/lib/content/ContentAdapter';

/**
 * Animated counter hook with intersection observer
 */
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number | undefined;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count, ref };
}

/**
 * HeroNew - Redesigned hero section matching the design template
 *
 * Features:
 * - Large 3-line title with brand colors
 * - Monolith card with member counter
 * - 3 CTA buttons
 * - Mouse-follow shadow effect
 * - Theme-aware styling
 * - i18n support
 */
export function HeroNew() {
  const t = useTranslations('hero');
  const [stats, setStats] = useState({ totalMembers: 0, weeklyGrowth: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mouse follow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (window.innerWidth / 2 - e.pageX) / 80,
        y: (window.innerHeight / 2 - e.pageY) / 80,
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { count: animatedCount, ref: counterRef } = useAnimatedCounter(stats.totalMembers);
  const memberGoal = ContentAdapter.getMemberGoal();
  const progress = memberGoal > 0 ? (stats.totalMembers / memberGoal) * 100 : 0;

  return (
    <section className="hero-section">
      <Scaffold className="hero-scaffold">
        {/* Left column - Title */}
        <div className="hero-content col-span-7">
          <Pill variant="bronze" className="hero-governance-pill">
            {t('governance')}
          </Pill>

          <p className="hero-kicker">{t('kicker')}</p>

          <h1 className="hero-title">
            <span className="hero-title-line">{t('h1a')}</span>
            <span className="hero-title-line hero-title-steel">{t('h1b')}</span>
            <span className="hero-title-line">{t('h1c')}</span>
          </h1>

          <p className="hero-lead">{t('lead')}</p>

          <CtaGroup className="hero-ctas">
            <HeavyCta href="/join" variant="primary" size="lg">
              {t('ctaJoin')}
            </HeavyCta>
            <HeavyCta href="/support" variant="secondary" size="lg">
              {t('ctaSupport')}
            </HeavyCta>
            <HeavyCta href="/help" variant="outline" size="lg">
              {t('ctaHelp')}
            </HeavyCta>
          </CtaGroup>
        </div>

        {/* Right column - Counter Card */}
        <div
          className="hero-monolith-wrapper col-span-5"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          }}
        >
          <MonolithCard tag="LIVE" className="hero-monolith">
            <div className="hero-counter" ref={counterRef}>
              <span className="hero-counter-label">
                {ContentAdapter.getOrgName('short')} //
              </span>
              <span className="hero-counter-value">
                {animatedCount.toLocaleString('uk-UA')}
              </span>
              <span className="hero-counter-growth">
                +{stats.weeklyGrowth} ↑
              </span>
            </div>

            {/* Progress bar */}
            <div className="hero-progress">
              <div className="hero-progress-labels">
                <span>0</span>
                <span>{memberGoal.toLocaleString('uk-UA')}</span>
              </div>
              <div className="hero-progress-track">
                <div
                  className="hero-progress-fill"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="hero-progress-percent">
                {progress.toFixed(1)}%
              </span>
            </div>
          </MonolithCard>
        </div>
      </Scaffold>
    </section>
  );
}
