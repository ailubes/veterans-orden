'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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

  return <span ref={ref}>{count.toLocaleString('uk-UA').replace(/,/g, ' ')}</span>;
};

export function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const currentMembers = 4569;
  const weeklyGrowth = 35;
  const memberGoal = 1000000;
  const percentage = (currentMembers / memberGoal) * 100;

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
      className="mobile-full"
      style={{
        gridColumn: '2 / 5',
        padding: '80px 0 100px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', // Kept 1fr 1fr for balance
        gap: '60px',
        position: 'relative',
        alignItems: 'start',
      }}
    >
      <div
        className="floating-timber hide-mobile"
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

      {/* Left Column */}
      <div>
        <p className="label" style={{ marginBottom: '20px' }}>
          Громадянська мережа політичного впливу
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
            ГУРТУЄМО
          </span>
          <span
            className="solid-text"
            style={{ display: 'block', color: '#d45d3a' }}
          >
            1,000,000
          </span>
          <span className="outline-text" style={{ display: 'block' }}>
            ВІЛЬНИХ
          </span>
          <span className="solid-text" style={{ display: 'block' }}>
            ЛЮДЕЙ
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
          Щоб змусити політиків ухвалити закон про зброю самозахисту та виконувати наші вимоги. Велика війна навчила нас:
          замало бути правим — потрібно бути сильним. Вступай, формуй порядок денний і стеж за його виконанням.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/sign-up" className="btn">
            ВСТУПИТИ ДО МЕРЕЖІ →
          </Link>
          <Link href="/manifest" className="btn btn-outline">
            МАНІФЕСТ
          </Link>
        </div>
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div
          style={{
            background: '#2c2824',
            color: '#e8e2d6',
            padding: '50px 40px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '640px',
            height: '100%',
            width: '100%',
            maxWidth: '560px',
            overflow: 'hidden',
          }}
        >
          {/* Joints */}
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <p
              className="label"
              style={{
                color: '#d45d3a',
                marginBottom: '20px',
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              ЧЛЕНІВ У МЕРЕЖІ
            </p>

            {/* FIX: Reduced clamp to 9vw / 130px to stop clipping */}
            <div
              className="syne"
              style={{
                fontSize: 'clamp(64px, 9vw, 130px)',
                fontWeight: 800,
                lineHeight: 0.85,
                marginBottom: '24px',
                width: '100%',
                whiteSpace: 'nowrap',
              }}
            >
              <AnimatedCounter end={currentMembers} />
            </div>

            <p style={{ fontSize: '12px', color: '#d45d3a', marginBottom: '32px' }}>
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
                <span>100K</span>
                <span>500K</span>
                <span>1M</span>
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
                    width: `${percentage}%`,
                    background: '#d45d3a',
                    minWidth: '4px',
                  }}
                />
                <div style={{ position: 'absolute', left: '10%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              </div>
            </div>

            <p style={{ fontSize: '11px', opacity: 0.7 }}>
              {percentage.toFixed(2)}% ДО МЕТИ
            </p>
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '40px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div>
              <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>
                МЕТА 1
              </p>
              <p className="syne" style={{ fontSize: '18px', fontWeight: 700 }}>
                100K
              </p>
              <p style={{ fontSize: '10px', opacity: 0.7 }}>
                Порядок денний
              </p>
            </div>
            <div>
              <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>
                МЕТА 2
              </p>
              <p className="syne" style={{ fontSize: '18px', fontWeight: 700 }}>
                1M
              </p>
              <p style={{ fontSize: '10px', opacity: 0.7 }}>
                Ухвалити закон
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}