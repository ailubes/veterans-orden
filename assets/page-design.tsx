'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Types ---
interface AnimatedCounterProps {
  end: number;
  duration?: number;
}

interface NewsItem {
  date: string;
  title: string;
  excerpt: string;
}

interface FrameworkItem {
  num: string;
  title: string;
  desc: string;
}

// --- Components ---

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
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

export default function Home() {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentMembers = 4569;
  const weeklyGrowth = 35;
  const memberGoal = 1000000;
  
  // Calculate percentage for the progress bar
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

  const frameworks: FrameworkItem[] = [
    {
      num: '01',
      title: 'ГУРТУВАННЯ',
      desc: 'Об\'єднуємо 1,000,000 громадян у Мережу політичного впливу для формування колективної спроможності.',
    },
    {
      num: '02',
      title: 'ВИМОГИ',
      desc: 'Формуємо програмні вимоги до політиків шляхом прямого голосування кожного члена Мережі.',
    },
    {
      num: '03',
      title: 'КОНТРОЛЬ',
      desc: 'Наймаємо політиків на роботу та контролюємо виконання наших вимог через імперативний мандат.',
    },
  ];

  const news: NewsItem[] = [
    {
      date: '18.12.2024',
      title: 'Мережа проголосувала за Положення про праймеріз',
      excerpt: 'Члени Мережі одноголосно підтримали новий механізм внутрішнього відбору кандидатів.',
    },
    {
      date: '15.12.2024',
      title: 'Підбиваємо підсумки перших дев\'яти місяців',
      excerpt: 'Від ідеї до 4,500+ членів: як ми будуємо інфраструктуру демократії в Україні.',
    },
    {
      date: '10.12.2024',
      title: 'Що зміниться в Мережі до кінця 2025 року?',
      excerpt: 'Плани розвитку: нові функції, регіональні осередки та шлях до 100,000 членів.',
    },
  ];

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
      {/* Noise Filter */}
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.3,
          mixBlendMode: 'multiply',
        }}
        aria-hidden="true"
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Main Grid Container */}
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
        <div className="beam-v" style={{ left: '80px' }} />
        <div className="beam-v" style={{ right: '80px' }} />
        <div className="beam-v" style={{ left: '50%', opacity: 0.5 }} />

        {/* Navigation */}
        <nav
          style={{
            gridColumn: '2 / 5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '40px 0',
            borderBottom: '2px solid var(--timber-dark)',
            zIndex: 10,
          }}
        >
          <Link
            href="/"
            className="syne"
            style={{
              fontSize: '20px',
              fontWeight: 800,
              textDecoration: 'none',
              color: 'var(--timber-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--timber-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'var(--canvas)', fontSize: '18px' }}>М</span>
            </div>
            <span className="hide-mobile">МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div className="hide-mobile" style={{ display: 'flex', gap: '40px' }}>
              <Link href="/manifest" style={{ textDecoration: 'none', color: 'var(--timber-dark)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>МАНІФЕСТ</Link>
              <Link href="/about" style={{ textDecoration: 'none', color: 'var(--timber-dark)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>ПРО НАС</Link>
              <Link href="/news" style={{ textDecoration: 'none', color: 'var(--timber-dark)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>НОВИНИ</Link>
              <Link href="/contacts" style={{ textDecoration: 'none', color: 'var(--timber-dark)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>КОНТАКТИ</Link>
            </div>
            <Link href="/sign-up" className="btn hide-mobile" style={{ padding: '15px 25px', fontSize: '11px' }}>
              ДОЄДНАТИСЬ
            </Link>
          </div>
        </nav>

        {/* HERO SECTION */}
        <header
          className="mobile-full"
          style={{
            gridColumn: '2 / 5',
            padding: '80px 0 100px',
            display: 'grid',
            // --- FIX 1: KEEPING THE ORIGINAL GRID RATIO (1.5fr / 1fr) ---
            gridTemplateColumns: '1.5fr 1fr',
            gap: '60px',
            position: 'relative',
            alignItems: 'start',
          }}
        >
          {/* Floating Timber */}
          <div
            className="floating-timber hide-mobile"
            style={{
              position: 'absolute',
              width: '300px',
              height: '10px',
              background: 'var(--accent)',
              left: '-50px',
              top: '200px',
              transform: `rotate(-5deg) translate(${mousePos.x}px, ${mousePos.y}px)`,
              zIndex: 1,
              opacity: 0.8,
            }}
          />

          {/* Left Column */}
          <div style={{ paddingTop: '20px' }}>
            <p className="label" style={{ marginBottom: '20px' }}>
              Громадянська мережа політичного впливу
            </p>
            <h1
              className="syne"
              style={{
                fontSize: 'clamp(48px, 6.5vw, 100px)',
                textTransform: 'uppercase',
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                marginBottom: '40px',
              }}
            >
              <span className="outline-text" style={{ display: 'block' }}>ГУРТУЄМО</span>
              <span className="solid-text" style={{ display: 'block', color: 'var(--accent)' }}>1,000,000</span>
              <span className="outline-text" style={{ display: 'block' }}>ВІЛЬНИХ</span>
              <span className="solid-text" style={{ display: 'block' }}>ЛЮДЕЙ</span>
            </h1>
            <p style={{ fontSize: '16px', maxWidth: '500px', marginBottom: '30px', lineHeight: 1.6 }}>
              Щоб змусити політиків ухвалити закон про зброю самозахисту та виконувати наші вимоги. Велика війна навчила нас: замало бути правим — потрібно бути сильним.
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

          {/* Right Column - UPDATED CARD DESIGN */}
          <div
            style={{
              background: 'var(--timber-dark)',
              color: 'var(--grain)',
              padding: '50px 40px',
              position: 'relative',
              // --- FIX 2: FLEXBOX STRETCH + MIN-HEIGHT ---
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '600px', // Forces height to match left side
              height: '100%',
              width: '100%',
              overflow: 'hidden', // Critical for the big text
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
                  color: 'var(--accent)',
                  marginBottom: '20px',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                ЧЛЕНІВ У МЕРЕЖІ
              </p>

              {/* FIX 3: MASSIVE FONT SIZE */}
              <div
                className="syne"
                style={{
                  fontSize: 'clamp(56px, 10vw, 130px)', // Increased Max size
                  fontWeight: 900,
                  lineHeight: 0.8,
                  marginBottom: '30px',
                  width: '100%',
                  whiteSpace: 'nowrap',
                }}
              >
                <AnimatedCounter end={currentMembers} />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '50px' }}>
                +{weeklyGrowth} ЗА ТИЖДЕНЬ ↑
              </p>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '8px', opacity: 0.6 }}>
                  <span>0</span>
                  <span>100K</span>
                  <span>500K</span>
                  <span>1M</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${percentage}%`,
                      background: 'var(--accent)',
                      minWidth: '4px',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '10%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                </div>
              </div>
              <p style={{ fontSize: '11px', opacity: 0.7 }}>{percentage.toFixed(2)}% ДО МЕТИ</p>
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
                <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>МЕТА 1</p>
                <p className="syne" style={{ fontSize: '18px', fontWeight: 700 }}>
                  100K
                </p>
                <p style={{ fontSize: '10px', opacity: 0.7 }}>Порядок денний</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>МЕТА 2</p>
                <p className="syne" style={{ fontSize: '18px', fontWeight: 700 }}>
                  1M
                </p>
                <p style={{ fontSize: '10px', opacity: 0.7 }}>Ухвалити закон</p>
              </div>
            </div>
          </div>
        </header>

        {/* Frameworks Grid */}
        <div
          className="mobile-full"
          style={{
            gridColumn: '2 / 5',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--grid-line)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          {frameworks.map((item, i) => (
            <div key={i} className="card">
              {i === 0 && <div className="joint" style={{ top: '-6px', left: '-6px' }} />}
              {i === 2 && <div className="joint" style={{ top: '-6px', right: '-6px' }} />}
              <p className="label">НАПРЯМОК {item.num}</p>
              <span
                className="card-title syne"
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  display: 'block',
                  margin: '20px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {item.title}
              </span>
              <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div
          style={{
            gridColumn: '1 / 6',
            background: 'var(--timber-beam)',
            color: 'var(--grain)',
            padding: '60px 80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '40px',
            clipPath: 'polygon(0 15%, 100% 0, 100% 85%, 0 100%)',
            margin: '20px 0 80px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: 'var(--grain)', opacity: 0.7 }}>
              Голосів у ДІЇ
            </p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>
              0
            </p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>ЗА ПРАВО НА ЗБРОЮ</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: 'var(--grain)', opacity: 0.7 }}>
              Підтримка
            </p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>
              0%
            </p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>УКРАЇНЦІВ</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: 'var(--grain)', opacity: 0.7 }}>
              Засновано
            </p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>
              0
            </p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>РІК</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: 'var(--grain)', opacity: 0.7 }}>
              Статус
            </p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>
              ГО
            </p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>ЄДРПОУ 45854363</p>
          </div>
        </div>

        {/* News Section */}
        <div style={{ gridColumn: '2 / 5', marginBottom: '80px' }} id="news">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
              borderBottom: '2px solid var(--timber-dark)',
              paddingBottom: '20px',
            }}
          >
            <div>
              <p className="label">ОСТАННІ ОНОВЛЕННЯ</p>
              <h2
                className="syne"
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  marginTop: '10px',
                }}
              >
                НОВИНИ
              </h2>
            </div>
            <Link
              href="/news"
              style={{
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ВСІ НОВИНИ →
            </Link>
          </div>
          <div
            className="mobile-full"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: '1px',
              background: 'var(--grid-line)',
              border: '1px solid var(--grid-line)',
            }}
          >
            <div
              style={{
                background: 'var(--timber-dark)',
                color: 'var(--grain)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '350px',
              }}
            >
              <div>
                <p className="label" style={{ color: 'var(--accent)' }}>
                  ГОЛОВНЕ
                </p>
                <h3
                  className="syne"
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    marginTop: '20px',
                    lineHeight: 1.2,
                  }}
                >
                  {news[0].title}
                </h3>
                <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8, lineHeight: 1.6 }}>
                  {news[0].excerpt}
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '30px',
                }}
              >
                <span style={{ fontSize: '11px', opacity: 0.5 }}>{news[0].date}</span>
                <Link
                  href="/news/praymeriz-2024"
                  style={{
                    color: 'var(--accent)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  ЧИТАТИ →
                </Link>
              </div>
            </div>
            <div style={{ background: 'var(--canvas)' }}>
              {news.slice(1).map((item, i) => (
                <div key={i} className="news-card">
                  <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '10px' }}>{item.date}</p>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', lineHeight: 1.3 }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1.5 }}>{item.excerpt}</p>
                </div>
              ))}
              <div
                style={{
                  padding: '30px',
                  background: 'rgba(212, 93, 58, 0.1)',
                  borderTop: '1px solid var(--grid-line)',
                }}
              >
                <p className="label">ДИВІТЬСЯ ЩОВІВТОРКА</p>
                <a
                  href="https://www.youtube.com/@ZBROIOVYILOBIST"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '15px',
                    color: 'var(--timber-dark)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  <span
                    style={{
                      background: 'var(--accent)',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '10px',
                    }}
                  >
                    ▶ YT
                  </span>
                  ЗБРОЙОВИЙ ЛОБІСТ
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="col-start-2 col-end-[-2] md:col-start-2 md:col-end-5 border-t-2 border-timber-dark">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px',
              padding: '60px 0',
              borderBottom: '1px solid var(--grid-line)',
            }}
          >
            <div>
              <p className="label">КОНТАКТИ</p>
              <p style={{ marginTop: '15px', fontSize: '14px', lineHeight: 1.8 }}>
                info@freepeople.org.ua
                <br />
                097 782 6978
              </p>
            </div>
            <div>
              <p className="label">АДРЕСА</p>
              <p style={{ marginTop: '15px', fontSize: '14px', lineHeight: 1.8 }}>
                Київська обл., Бучанський р-н
                <br />
                с. Петропавлівська Борщагівка
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="label">СОЦІАЛЬНІ МЕРЕЖІ</p>
              <p style={{ marginTop: '15px', fontSize: '14px' }}>
                <a href="#" style={{ color: 'var(--timber-dark)', marginRight: '20px' }}>
                  YT
                </a>
                <a href="#" style={{ color: 'var(--timber-dark)' }}>
                  FB
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}