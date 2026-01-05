'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ContentAdapter } from '@/lib/content/ContentAdapter';

const AnimatedCounter = ({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

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

  return <span ref={ref}>{count.toLocaleString('uk-UA')}</span>;
};

export function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMembers = stats.totalMembers;
  const weeklyGrowth = stats.weeklyGrowth;
  const memberGoal = ContentAdapter.getMemberGoal();
  const milestones = ContentAdapter.getMilestones();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (window.innerWidth / 2 - e.pageX) / 50,
        y: (window.innerHeight / 2 - e.pageY) / 50,
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <header
      className="mobile-full hero-grid"
      style={{
        gridColumn: '2 / 5',
        padding: '80px 0 100px',
        position: 'relative',
        minHeight: '600px',
      }}
    >
      {/* Floating Timber Element */}
      <div
        className="floating-element hide-mobile"
        style={{
          position: 'absolute',
          width: '300px',
          height: '10px',
          background: '#d45d3a',
          left: '-50px',
          top: '200px',
          transform: `rotate(-5deg) translate(${mousePos.x}px, ${mousePos.y}px)`,
          zIndex: 1,
          opacity: 0.8,
        }}
      />

      {/* Left Column - Title */}
      <div style={{ maxWidth: 'calc(50% - 40px)' }}>
        <p className="label" style={{ marginBottom: '20px' }}>
          БРАТЕРСТВО ЧЕСТІ ТА ДІЇ
        </p>

        <h1
          className="syne"
          style={{
            fontSize: 'clamp(48px, 7vw, 100px)',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            marginBottom: '40px',
          }}
        >
          <span className="outline-text" style={{ display: 'block' }}>
            МІЦНІСТЬ
          </span>
          <span className="solid-text" style={{ display: 'block', color: '#d45d3a' }}>
            ЯКА НЕ
          </span>
          <span className="outline-text" style={{ display: 'block' }}>
            ТРІСКАЄ
          </span>
        </h1>

        <p
          style={{
            fontSize: '16px',
            maxWidth: '500px',
            marginBottom: '30px',
            lineHeight: 1.6,
          }}
        >
          {ContentAdapter.getOrgName('short')} — це спільнота підтримки та дисципліноване ядро дії. Ми існуємо для того, щоб ветеран не залишався один: у питаннях адаптації, захисту прав, психологічної підтримки, розвитку, працевлаштування та повернення до нормального життя.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/join" className="btn">
            ПРИЄДНАТИСЯ →
          </Link>
          <Link href="/support" className="btn" style={{ backgroundColor: 'var(--accent)', color: 'var(--panel-850)' }}>
            ПІДТРИМАТИ
          </Link>
          <Link href="/help-request" className="btn" style={{ backgroundColor: 'transparent', border: '2px solid var(--panel-850)', color: 'var(--panel-850)' }}>
            ПОТРІБНА ДОПОМОГА
          </Link>
        </div>
      </div>

      {/* Right Column - Counter Card */}
      <div
        className="counter-card card-with-joints"
        style={{
          background: '#2c2824',
          color: '#e8e2d6',
          padding: '40px',
          position: 'absolute',
          /* Right edge aligns with right beam (at right edge of hero), with room for joints */
          right: '10px',
          top: '80px',
          /* Left edge is 20px right of center (50% of hero) */
          left: 'calc(50% + 20px)',
          border: '2px solid var(--panel-850)',
        }}
      >
        {/* Corner joints - positioned so card corner is in center of joint */}
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label" style={{ color: '#d45d3a', marginBottom: '10px' }}>
          ЧЛЕНІВ ОРДЕНУ
        </p>

        <div
          className="syne"
          style={{
            fontSize: 'clamp(56px, 10vw, 130px)',
            fontWeight: 800,
            lineHeight: 1,
            marginBottom: '10px',
          }}
        >
          <AnimatedCounter end={currentMembers} />
        </div>

        <p
          style={{
            fontSize: '12px',
            color: '#d45d3a',
            marginBottom: '30px',
          }}
        >
          +{weeklyGrowth} ЗА ТИЖДЕНЬ ↑
        </p>

        {/* Progress Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              marginBottom: '8px',
              opacity: 0.6,
            }}
          >
            <span>0</span>
            <span>{(memberGoal * 0.25).toLocaleString('uk-UA', { maximumFractionDigits: 0 })}</span>
            <span>{(memberGoal * 0.5).toLocaleString('uk-UA', { maximumFractionDigits: 0 })}</span>
            <span>{memberGoal.toLocaleString('uk-UA')}</span>
          </div>
          <div
            style={{
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(currentMembers / memberGoal) * 100}%`,
                background: '#d45d3a',
                minWidth: '4px',
              }}
            />
            {/* Milestone markers */}
            {milestones.map((milestone) => (
              <div
                key={milestone.target}
                style={{
                  position: 'absolute',
                  left: `${(milestone.target / memberGoal) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  background: 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>

        <p style={{ fontSize: '11px', opacity: 0.7 }}>
          {((currentMembers / memberGoal) * 100).toFixed(2)}% ДО МЕТИ
        </p>

        <div
          style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'grid',
            gridTemplateColumns: milestones.length <= 2 ? '1fr 1fr' : '1fr 1fr 1fr',
            gap: '20px',
          }}
        >
          {milestones.map((milestone, index) => (
            <div key={milestone.target}>
              <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>
                МЕТА {index + 1}
              </p>
              <p className="syne" style={{ fontSize: '18px', fontWeight: 700 }}>
                {milestone.target.toLocaleString('uk-UA')}
              </p>
              <p style={{ fontSize: '10px', opacity: 0.7 }}>{milestone.label}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
