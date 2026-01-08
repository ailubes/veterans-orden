'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    statement: 'Орден не роздає гуманітарну допомогу.',
    contrast: 'Орден – спільнота, яка прийде на допомогу!',
  },
  {
    id: 2,
    statement: 'Орден не пропонує телефони юристів чи психологів.',
    contrast: 'Орден – підставить плече та захистить від свавілля!',
  },
  {
    id: 3,
    statement: 'Орден - не Якудза.',
    contrast: 'Але Орден – організація з жорсткою ієрархією та відданістю членів.',
  },
  {
    id: 4,
    statement: 'Орден – не Тріади.',
    contrast: 'Але Орден - це розповсюджена мережа осередків.',
  },
  {
    id: 5,
    statement: 'Орден – не Коза Ностра.',
    contrast: 'Але Орден - це родина, де внутрішні правила важливіші за зовнішні.',
  },
  {
    id: 6,
    statement: 'Хто може стати членом Ордену?',
    contrast: 'Військовий, ветеран, член родини Воїна, або просто патріот, який підтримує Ідею Ордену, та прийме Присягу Ордену.',
  },
];

export function ImpactSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
      setIsVisible(true);
    }, 400);

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  }, [isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      setIsVisible(true);
    }, 400);

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  }, [isAnimating]);

  const goToSlide = useCallback((idx: number) => {
    if (isAnimating || idx === currentIndex) return;
    setIsAnimating(true);
    setIsVisible(false);

    setTimeout(() => {
      setCurrentIndex(idx);
      setIsVisible(true);
    }, 400);

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  }, [isAnimating, currentIndex]);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(goToNext, 7000);
    return () => clearInterval(interval);
  }, [goToNext]);

  const currentSlide = SLIDES[currentIndex];

  return (
    <section className="impact-section">
      {/* Background decorative elements */}
      <div className="impact-bg">
        <div className="impact-grid-lines" />
        <div className="impact-glow" />
      </div>

      <div className="impact-container">
        {/* Counter badge */}
        <div className="impact-counter">
          <span className="impact-counter-current">{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className="impact-counter-divider">/</span>
          <span className="impact-counter-total">{String(SLIDES.length).padStart(2, '0')}</span>
        </div>

        {/* Main content */}
        <div className={`impact-content ${isVisible ? 'visible' : ''}`}>
          {/* Strike-through statement */}
          <div className="impact-statement-wrapper">
            <h2 className="impact-statement">
              <span className="impact-strike">{currentSlide.statement}</span>
            </h2>
          </div>

          {/* Affirmation */}
          <div className="impact-affirmation-wrapper">
            <p className="impact-affirmation">
              {currentSlide.contrast}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="impact-nav">
          <button
            onClick={goToPrev}
            className="impact-nav-btn"
            aria-label="Попередній слайд"
            disabled={isAnimating}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="impact-progress">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`impact-progress-segment ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? 'passed' : ''}`}
                aria-label={`Слайд ${idx + 1}`}
                disabled={isAnimating}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="impact-nav-btn"
            aria-label="Наступний слайд"
            disabled={isAnimating}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .impact-section {
          position: relative;
          padding: 6rem 0;
          background: var(--bg-950);
          overflow: hidden;
          min-height: 500px;
          display: flex;
          align-items: center;
        }

        .impact-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .impact-grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(90deg, var(--line) 1px, transparent 1px),
            linear-gradient(var(--line) 1px, transparent 1px);
          background-size: 80px 80px;
          opacity: 0.3;
        }

        .impact-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(181, 121, 58, 0.08) 0%, transparent 70%);
        }

        .impact-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .impact-counter {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          font-family: 'IBM Plex Mono', monospace;
          margin-bottom: 3rem;
        }

        .impact-counter-current {
          font-size: 2rem;
          font-weight: 900;
          color: var(--bronze);
          line-height: 1;
        }

        .impact-counter-divider {
          font-size: 1rem;
          color: var(--muted-500);
          margin: 0 0.25rem;
        }

        .impact-counter-total {
          font-size: 1rem;
          color: var(--muted-500);
        }

        .impact-content {
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .impact-content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .impact-statement-wrapper {
          margin-bottom: 2.5rem;
        }

        .impact-statement {
          font-family: 'Inter', sans-serif;
          font-size: clamp(1.75rem, 5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--muted-500);
          text-transform: uppercase;
          max-width: 1000px;
          margin: 0 auto;
        }

        .impact-strike {
          position: relative;
          display: inline;
        }

        .impact-strike::after {
          content: '';
          position: absolute;
          left: -2%;
          right: -2%;
          top: 50%;
          height: 4px;
          background: var(--bronze);
          transform: translateY(-50%) rotate(-1deg);
          opacity: 0.9;
        }

        .impact-affirmation-wrapper {
          position: relative;
        }

        .impact-affirmation-wrapper::before {
          content: '';
          display: block;
          width: 80px;
          height: 4px;
          background: var(--bronze);
          margin: 0 auto 2rem;
        }

        .impact-affirmation {
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          font-weight: 500;
          line-height: 1.6;
          color: var(--text-100);
          max-width: 800px;
          margin: 0 auto;
        }

        .impact-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 4rem;
        }

        .impact-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: transparent;
          border: 2px solid var(--line);
          border-radius: 50%;
          color: var(--text-200);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .impact-nav-btn:hover:not(:disabled) {
          background: var(--bronze);
          border-color: var(--bronze);
          color: var(--bg-950);
          transform: scale(1.05);
        }

        .impact-nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .impact-progress {
          display: flex;
          gap: 6px;
        }

        .impact-progress-segment {
          width: 32px;
          height: 4px;
          background: var(--line);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .impact-progress-segment::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--bronze);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .impact-progress-segment.passed::after {
          transform: scaleX(1);
        }

        .impact-progress-segment.active {
          background: var(--bronze);
        }

        .impact-progress-segment.active::after {
          animation: progress-fill 7s linear forwards;
        }

        @keyframes progress-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .impact-progress-segment:hover:not(:disabled) {
          background: var(--text-200);
        }

        .impact-progress-segment:disabled {
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .impact-section {
            padding: 4rem 0;
            min-height: 450px;
          }

          .impact-container {
            padding: 0 1rem;
          }

          .impact-counter {
            margin-bottom: 2rem;
          }

          .impact-counter-current {
            font-size: 1.5rem;
          }

          .impact-statement {
            font-size: clamp(1.25rem, 6vw, 2rem);
          }

          .impact-strike::after {
            height: 3px;
          }

          .impact-affirmation {
            font-size: 1rem;
          }

          .impact-affirmation-wrapper::before {
            width: 60px;
            height: 3px;
            margin-bottom: 1.5rem;
          }

          .impact-nav {
            margin-top: 3rem;
            gap: 1rem;
          }

          .impact-nav-btn {
            width: 40px;
            height: 40px;
          }

          .impact-progress-segment {
            width: 24px;
          }
        }
      `}</style>
    </section>
  );
}
