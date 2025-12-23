import React, { useState, useEffect, useRef } from 'react';

// Animated counter
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count.toLocaleString('uk-UA')}</span>;
};

export default function MerezhaTimberDesign() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const currentMembers = 4569;
  const weeklyGrowth = 35;

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (window.innerWidth / 2 - e.pageX) / 50,
        y: (window.innerHeight / 2 - e.pageY) / 50
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const navLinks = [
    { label: 'МАНІФЕСТ', href: '#manifest' },
    { label: 'ПРО НАС', href: '#about' },
    { label: 'НОВИНИ', href: '#news' },
    { label: 'КОНТАКТИ', href: '#contacts' },
  ];

  const frameworks = [
    {
      num: '01',
      title: 'ГУРТУВАННЯ',
      desc: 'Об\'єднуємо 1,000,000 громадян у Мережу політичного впливу для формування колективної спроможності.'
    },
    {
      num: '02',
      title: 'ВИМОГИ',
      desc: 'Формуємо програмні вимоги до політиків шляхом прямого голосування кожного члена Мережі.'
    },
    {
      num: '03',
      title: 'КОНТРОЛЬ',
      desc: 'Наймаємо політиків на роботу та контролюємо виконання наших вимог через імперативний мандат.'
    },
  ];

  const news = [
    {
      date: '18.12.2024',
      title: 'Мережа проголосувала за Положення про праймеріз',
      excerpt: 'Члени Мережі одноголосно підтримали новий механізм внутрішнього відбору кандидатів.'
    },
    {
      date: '15.12.2024',
      title: 'Підбиваємо підсумки перших дев\'яти місяців',
      excerpt: 'Від ідеї до 4,500+ членів: як ми будуємо інфраструктуру демократії в Україні.'
    },
    {
      date: '10.12.2024',
      title: 'Що зміниться в Мережі до кінця 2025 року?',
      excerpt: 'Плани розвитку: нові функції, регіональні осередки та шлях до 100,000 членів.'
    },
  ];

  return (
    <div style={{ 
      backgroundColor: '#f4f1eb', 
      color: '#2c2824',
      fontFamily: "'Space Mono', monospace",
      minHeight: '100vh',
      overflowX: 'hidden',
      lineHeight: 1.4
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        
        :root {
          --grain: #e8e2d6;
          --timber-dark: #2c2824;
          --timber-beam: #4a4238;
          --accent: #d45d3a;
          --joint: #1a1816;
          --canvas: #f4f1eb;
          --grid-line: rgba(74, 66, 56, 0.15);
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background-color: var(--canvas);
          color: var(--timber-dark);
          font-family: 'Space Mono', monospace;
        }
        
        .syne {
          font-family: 'Syne', sans-serif;
        }
        
        .label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--accent);
          font-weight: 700;
        }
        
        .outline-text {
          color: transparent;
          -webkit-text-stroke: 1.5px var(--timber-dark);
        }
        
        .solid-text {
          color: var(--timber-dark);
          -webkit-text-stroke: 0;
        }
        
        .card {
          background: var(--canvas);
          padding: 40px;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }
        
        .card:hover {
          background: var(--timber-dark);
          color: var(--canvas);
        }
        
        .card:hover .label {
          color: var(--accent);
        }
        
        .card:hover .card-title {
          color: var(--canvas);
        }
        
        .btn {
          display: inline-block;
          padding: 20px 40px;
          background: var(--timber-dark);
          color: var(--canvas);
          text-decoration: none;
          font-weight: 700;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          position: relative;
          transition: transform 0.2s ease;
          border: none;
          cursor: pointer;
        }
        
        .btn:hover {
          transform: translate(4px, -4px);
          box-shadow: -4px 4px 0 var(--accent);
        }
        
        .btn-outline {
          background: transparent;
          color: var(--timber-dark);
          border: 2px solid var(--timber-dark);
        }
        
        .btn-outline:hover {
          background: var(--timber-dark);
          color: var(--canvas);
        }
        
        .joint {
          width: 12px;
          height: 12px;
          background: var(--timber-dark);
          position: absolute;
          z-index: 5;
        }
        
        .beam-v {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--grid-line);
          z-index: 1;
        }
        
        .beam-h {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--grid-line);
          z-index: 1;
        }
        
        .news-card {
          padding: 30px;
          border-bottom: 1px solid var(--grid-line);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .news-card:hover {
          background: rgba(212, 93, 58, 0.05);
          padding-left: 40px;
        }
        
        .news-card:last-child {
          border-bottom: none;
        }
        
        @keyframes float {
          0%, 100% { transform: rotate(-5deg) translate(0, 0); }
          50% { transform: rotate(-5deg) translate(10px, -10px); }
        }
        
        .floating-timber {
          animation: float 6s ease-in-out infinite;
        }
        
        @media (max-width: 900px) {
          .hide-mobile { display: none !important; }
          .mobile-full { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Grain Overlay */}
      <svg style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.3,
        mixBlendMode: 'multiply'
      }}>
        <filter id='noiseFilter'>
          <feTurbulence 
            type='fractalNoise' 
            baseFrequency='0.65' 
            numOctaves='3' 
            stitchTiles='stitch'
          />
        </filter>
        <rect width='100%' height='100%' filter='url(#noiseFilter)' />
      </svg>

      {/* Main Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 1fr 80px',
        minHeight: '100vh',
        borderLeft: '1px solid rgba(74, 66, 56, 0.15)',
        borderRight: '1px solid rgba(74, 66, 56, 0.15)',
        margin: '0 auto',
        maxWidth: '1600px',
        position: 'relative'
      }}>
        {/* Structural Beams */}
        <div className="beam-v" style={{ left: '80px' }} />
        <div className="beam-v" style={{ right: '80px' }} />
        <div className="beam-v" style={{ left: '50%', opacity: 0.5 }} />

        {/* Navigation */}
        <nav style={{
          gridColumn: '2 / 5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '40px 0',
          borderBottom: '2px solid #2c2824',
          zIndex: 10
        }}>
          <a href="#" style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '20px',
            fontWeight: 800,
            textDecoration: 'none',
            color: '#2c2824',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img 
              src="/mnt/user-data/uploads/1766475321869_image.png" 
              alt="Logo"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <span className="hide-mobile">МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ</span>
          </a>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div className="hide-mobile" style={{ display: 'flex', gap: '40px' }}>
              {navLinks.map((link, i) => (
                <a 
                  key={i}
                  href={link.href}
                  style={{
                    textDecoration: 'none',
                    color: '#2c2824',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#d45d3a'}
                  onMouseLeave={(e) => e.target.style.color = '#2c2824'}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <button className="btn" style={{ padding: '15px 25px', fontSize: '11px' }}>
              ДОЄДНАТИСЬ
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header style={{
          gridColumn: '2 / 5',
          padding: '80px 0 100px',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '60px',
          position: 'relative'
        }} className="mobile-full">
          {/* Floating Timber Element */}
          <div 
            className="floating-timber"
            style={{
              position: 'absolute',
              width: '300px',
              height: '10px',
              background: '#d45d3a',
              left: '-50px',
              top: '200px',
              transform: `rotate(-5deg) translate(${mousePos.x}px, ${mousePos.y}px)`,
              zIndex: 1,
              opacity: 0.8
            }}
          />

          {/* Left Column - Title */}
          <div>
            <p className="label" style={{ marginBottom: '20px' }}>
              Громадянська мережа політичного впливу
            </p>
            
            <h1 className="syne" style={{
              fontSize: 'clamp(48px, 7vw, 100px)',
              textTransform: 'uppercase',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              marginBottom: '40px'
            }}>
              <span className="outline-text" style={{ display: 'block' }}>ГУРТУЄМО</span>
              <span className="solid-text" style={{ display: 'block', color: '#d45d3a' }}>1,000,000</span>
              <span className="outline-text" style={{ display: 'block' }}>ВІЛЬНИХ</span>
              <span className="solid-text" style={{ display: 'block' }}>ЛЮДЕЙ</span>
            </h1>

            <p style={{ fontSize: '16px', maxWidth: '500px', marginBottom: '30px', lineHeight: 1.6 }}>
              Щоб змусити політиків ухвалити закон про зброю самозахисту 
              та виконувати наші вимоги. Велика війна навчила нас: замало бути 
              правим — потрібно бути сильним.
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button className="btn">ВСТУПИТИ ДО МЕРЕЖІ →</button>
              <button className="btn btn-outline">МАНІФЕСТ</button>
            </div>
          </div>

          {/* Right Column - Counter Card */}
          <div style={{
            background: '#2c2824',
            color: '#e8e2d6',
            padding: '40px',
            position: 'relative'
          }}>
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />
            
            <p className="label" style={{ color: '#d45d3a', marginBottom: '10px' }}>
              ЧЛЕНІВ У МЕРЕЖІ
            </p>
            
            <div className="syne" style={{ 
              fontSize: 'clamp(56px, 8vw, 80px)', 
              fontWeight: 800, 
              lineHeight: 1,
              marginBottom: '10px'
            }}>
              <AnimatedCounter end={currentMembers} />
            </div>
            
            <p style={{ 
              fontSize: '12px', 
              color: '#d45d3a',
              marginBottom: '30px'
            }}>
              +{weeklyGrowth} ЗА ТИЖДЕНЬ ↑
            </p>

            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '10px',
                marginBottom: '8px',
                opacity: 0.6
              }}>
                <span>0</span>
                <span>100K</span>
                <span>500K</span>
                <span>1M</span>
              </div>
              <div style={{
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${(currentMembers / 1000000) * 100}%`,
                  background: '#d45d3a',
                  minWidth: '4px'
                }} />
                {/* Milestone markers */}
                <div style={{ position: 'absolute', left: '10%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              </div>
            </div>

            <p style={{ fontSize: '11px', opacity: 0.7 }}>
              {((currentMembers / 1000000) * 100).toFixed(2)}% ДО МЕТИ
            </p>

            <div style={{ 
              marginTop: '30px', 
              paddingTop: '20px', 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div>
                <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>МЕТА 1</p>
                <p className="syne" style={{ fontSize: '18px', fontWeight: 700 }}>100K</p>
                <p style={{ fontSize: '10px', opacity: 0.7 }}>Порядок денний</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>МЕТА 2</p>
                <p className="syne" style={{ fontSize: '18px', fontWeight: 700 }}>1M</p>
                <p style={{ fontSize: '10px', opacity: 0.7 }}>Ухвалити закон</p>
              </div>
            </div>
          </div>
        </header>

        {/* Framework Cards */}
        <div style={{
          gridColumn: '2 / 5',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(74, 66, 56, 0.15)',
          border: '1px solid rgba(74, 66, 56, 0.15)',
          marginBottom: '80px'
        }} className="mobile-full">
          {frameworks.map((item, i) => (
            <div key={i} className="card">
              {i === 0 && <div className="joint" style={{ top: '-6px', left: '-6px' }} />}
              {i === 2 && <div className="joint" style={{ top: '-6px', right: '-6px' }} />}
              <p className="label">НАПРЯМОК {item.num}</p>
              <span className="card-title syne" style={{
                fontSize: '32px',
                fontWeight: 700,
                display: 'block',
                margin: '20px 0',
                letterSpacing: '-0.02em'
              }}>
                {item.title}
              </span>
              <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div style={{
          gridColumn: '1 / 6',
          background: '#4a4238',
          color: '#e8e2d6',
          padding: '60px 80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '40px',
          clipPath: 'polygon(0 15%, 100% 0, 100% 85%, 0 100%)',
          margin: '20px 0 80px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: '#e8e2d6', opacity: 0.7 }}>Голосів у ДІЇ</p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>1,014,256</p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>ЗА ПРАВО НА ЗБРОЮ</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: '#e8e2d6', opacity: 0.7 }}>Підтримка</p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>52%</p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>УКРАЇНЦІВ</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: '#e8e2d6', opacity: 0.7 }}>Засновано</p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>2024</p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>РІК</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="label" style={{ color: '#e8e2d6', opacity: 0.7 }}>Статус</p>
            <p className="syne" style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>ГО</p>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>ЄДРПОУ 45854363</p>
          </div>
        </div>

        {/* News Section */}
        <div style={{ gridColumn: '2 / 5', marginBottom: '80px' }} id="news">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '40px',
            borderBottom: '2px solid #2c2824',
            paddingBottom: '20px'
          }}>
            <div>
              <p className="label">ОСТАННІ ОНОВЛЕННЯ</p>
              <h2 className="syne" style={{ 
                fontSize: '48px', 
                fontWeight: 800, 
                letterSpacing: '-0.03em',
                marginTop: '10px'
              }}>
                НОВИНИ
              </h2>
            </div>
            <a href="/news" style={{
              color: '#d45d3a',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none'
            }}>
              ВСІ НОВИНИ →
            </a>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '1px',
            background: 'rgba(74, 66, 56, 0.15)',
            border: '1px solid rgba(74, 66, 56, 0.15)'
          }} className="mobile-full">
            {/* Featured News */}
            <div style={{
              background: '#2c2824',
              color: '#e8e2d6',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '350px'
            }}>
              <div>
                <p className="label" style={{ color: '#d45d3a' }}>ГОЛОВНЕ</p>
                <h3 className="syne" style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginTop: '20px',
                  lineHeight: 1.2
                }}>
                  МЕРЕЖА ПРОГОЛОСУВАЛА ЗА ПОЛОЖЕННЯ ПРО ПРАЙМЕРІЗ
                </h3>
                <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8, lineHeight: 1.6 }}>
                  Члени Мережі одноголосно підтримали новий механізм внутрішнього 
                  відбору кандидатів. Це історичний крок до формування справжньої 
                  інфраструктури демократії.
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '30px'
              }}>
                <span style={{ fontSize: '11px', opacity: 0.5 }}>18.12.2024</span>
                <a href="#" style={{ 
                  color: '#d45d3a', 
                  fontSize: '12px', 
                  fontWeight: 700,
                  textDecoration: 'none'
                }}>
                  ЧИТАТИ →
                </a>
              </div>
            </div>

            {/* News List */}
            <div style={{ background: '#f4f1eb' }}>
              {news.slice(1).map((item, i) => (
                <div key={i} className="news-card">
                  <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '10px' }}>{item.date}</p>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 700,
                    marginBottom: '10px',
                    lineHeight: 1.3
                  }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1.5 }}>
                    {item.excerpt}
                  </p>
                </div>
              ))}
              
              {/* YouTube Link */}
              <div style={{ 
                padding: '30px',
                background: 'rgba(212, 93, 58, 0.1)',
                borderTop: '1px solid rgba(74, 66, 56, 0.15)'
              }}>
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
                    color: '#2c2824',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  <span style={{ 
                    background: '#d45d3a', 
                    color: 'white', 
                    padding: '8px 12px',
                    fontSize: '10px'
                  }}>
                    ▶ YT
                  </span>
                  ЗБРОЙОВИЙ ЛОБІСТ
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div style={{
          gridColumn: '2 / 5',
          padding: '80px 0',
          borderTop: '1px solid rgba(74, 66, 56, 0.15)',
          borderBottom: '1px solid rgba(74, 66, 56, 0.15)',
          marginBottom: '80px',
          position: 'relative'
        }}>
          <div className="joint" style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }} />
          
          <blockquote style={{ 
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <p className="syne" style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: '-0.02em'
            }}>
              "ПОЛІТИКІВ ЦІКАВИТЬ ЛИШЕ ДВІ РЕЧІ — 
              <span style={{ color: '#d45d3a' }}> ВИГРАТИ ВИБОРИ</span> ТА 
              <span style={{ color: '#d45d3a' }}> ВИГРАТИ ПЕРЕВИБОРИ</span>. 
              ВІДТАК, МІЛЬЙОН ЗГУРТОВАНИХ ГРОМАДЯН — ЦЕ СИЛА, 
              ЯКУ НЕ МОЖНА ІГНОРУВАТИ."
            </p>
            <cite style={{ 
              display: 'block',
              marginTop: '30px',
              fontSize: '12px',
              fontStyle: 'normal',
              opacity: 0.6
            }}>
              — МАНІФЕСТ МЕРЕЖІ ВІЛЬНИХ ЛЮДЕЙ
            </cite>
          </blockquote>
        </div>

        {/* CTA Section */}
        <div style={{
          gridColumn: '2 / 5',
          textAlign: 'center',
          padding: '60px 0 100px'
        }}>
          <p className="label" style={{ marginBottom: '20px' }}>ПРИЄДНУЙТЕСЬ</p>
          
          <h2 className="syne" style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            marginBottom: '30px'
          }}>
            <span className="outline-text">ДЛЯ ГУРТУВАННЯ</span><br />
            <span className="solid-text" style={{ color: '#d45d3a' }}>МІЛЬЙОНУ</span><br />
            <span className="solid-text">ПОТРІБНІ ВИ</span>
          </h2>

          <p style={{ 
            maxWidth: '600px', 
            margin: '0 auto 40px',
            fontSize: '16px',
            lineHeight: 1.6
          }}>
            Якщо кожен із нас щотижня залучатиме хоча б одну людину — 
            ми подвоюватимемо кількість членів щотижня. Геометрична прогресія!
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ padding: '25px 50px', fontSize: '14px' }}>
              ДОЄДНАТИСЬ ДО МЕРЕЖІ →
            </button>
          </div>

          <p style={{ 
            marginTop: '30px', 
            fontSize: '11px', 
            opacity: 0.5 
          }}>
            ЗАРЕЄСТРОВАНА ГО • ЄДРПОУ 45854363 • ПРОЗОРА ЗВІТНІСТЬ
          </p>
        </div>

        {/* Footer */}
        <footer style={{
          gridColumn: '2 / 5',
          padding: '60px 0',
          borderTop: '2px solid #2c2824',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '40px'
        }} className="mobile-full">
          <div>
            <p className="label">КОНТАКТИ</p>
            <p style={{ marginTop: '15px', fontSize: '14px', lineHeight: 1.8 }}>
              info@freepeople.org.ua<br />
              097 782 6978
            </p>
          </div>
          <div>
            <p className="label">АДРЕСА</p>
            <p style={{ marginTop: '15px', fontSize: '14px', lineHeight: 1.8 }}>
              Київська обл., Бучанський р-н<br />
              с. Петропавлівська Борщагівка
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="label">СОЦІАЛЬНІ МЕРЕЖІ</p>
            <p style={{ marginTop: '15px', fontSize: '14px' }}>
              <a href="#" style={{ color: '#2c2824', textDecoration: 'none', marginRight: '20px' }}>YT</a>
              <a href="#" style={{ color: '#2c2824', textDecoration: 'none', marginRight: '20px' }}>TG</a>
              <a href="#" style={{ color: '#2c2824', textDecoration: 'none' }}>FB</a>
            </p>
          </div>
        </footer>

        {/* Copyright */}
        <div style={{
          gridColumn: '2 / 5',
          padding: '20px 0 40px',
          borderTop: '1px solid rgba(74, 66, 56, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          opacity: 0.6
        }}>
          <span>© 2025 МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ</span>
          <span>ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!</span>
        </div>
      </div>
    </div>
  );
}
