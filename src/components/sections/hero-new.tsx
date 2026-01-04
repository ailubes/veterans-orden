'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Scaffold } from '@/components/layout/skeleton-grid';
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

  const { count: animatedCount, ref: counterRef } = useAnimatedCounter(stats.totalMembers);
  const memberGoal = ContentAdapter.getMemberGoal();
  const progress = memberGoal > 0 ? (stats.totalMembers / memberGoal) * 100 : 0;

  return (
    <>
      <section className="hero-section">
        <Scaffold className="hero-scaffold">
          {/* Full width - Title */}
          <div className="hero-content col-span-full">
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
        </Scaffold>
      </section>

      {/* Live Stats Dashboard - Below Hero */}
      <section className="live-stats-section">
        <Scaffold>
          <div className="col-span-full">
            <div className="live-stats-dashboard" ref={counterRef}>
              {/* LIVE Indicator */}
              <div className="live-stats-cell live-stats-cell--status">
                <div className="live-indicator">
                  <span className="live-indicator-dot" />
                  <span className="live-indicator-text">LIVE</span>
                </div>
              </div>

              <div className="live-stats-divider" />

              {/* Member Count */}
              <div className="live-stats-cell live-stats-cell--count">
                <span className="live-stats-label">ЧЛЕНІВ ОРДЕНУ</span>
                <span className="live-stats-number">
                  {animatedCount.toLocaleString('uk-UA')}
                </span>
              </div>

              <div className="live-stats-divider" />

              {/* Weekly Growth */}
              <div className="live-stats-cell live-stats-cell--growth">
                <span className="live-stats-label">ЗА ТИЖДЕНЬ</span>
                <span className="live-stats-growth-value">
                  <span className="live-stats-growth-icon">↑</span>
                  +{stats.weeklyGrowth}
                </span>
              </div>

              <div className="live-stats-divider" />

              {/* Progress to Goal */}
              <div className="live-stats-cell live-stats-cell--goal">
                <span className="live-stats-label">ЦІЛЬ: {memberGoal.toLocaleString('uk-UA')}</span>
                <div className="live-stats-progress-wrapper">
                  <div className="live-stats-progress-bar">
                    <div
                      className="live-stats-progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="live-stats-progress-percent">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Scaffold>
      </section>
    </>
  );
}
