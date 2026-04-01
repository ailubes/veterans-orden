'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  targetId?: string;
  position?: 'center' | 'top' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Ласкаво просимо до Ордену Ветеранів!',
    description:
      "Давайте познайомимо вас із вашим особистим кабінетом. Це займе лише хвилину. Натисніть «Далі», щоб почати.",
    position: 'center',
  },
  {
    title: 'Бали та рівень',
    description:
      'Тут відображаються ваші бали та поточний рівень. Заробляйте бали, виконуючи завдання, беручи участь у голосуваннях та запрошуючи нових членів.',
    targetId: 'points-stats',
    position: 'bottom',
  },
  {
    title: 'Завдання для просування',
    description:
      'Виконуйте завдання, щоб підвищити свій рівень в Ордені. Кожен рівень відкриває нові права та можливості.',
    targetId: 'role-progress',
    position: 'bottom',
  },
  {
    title: 'Запрошуйте друзів',
    description:
      'Розширюйте Орден! За кожного нового члена, якого ви запросили, ви отримуєте бони та піднімаєтесь у рейтингу.',
    targetId: 'referral-card',
    position: 'bottom',
  },
  {
    title: 'Навігація',
    description:
      'Використовуйте бічне меню для переходу між розділами: голосування, завдання, події, ресурси для ветеранів та інше. Вдалого вам шляху в Ордені!',
    position: 'center',
  },
];

interface OnboardingTourProps {
  userId: string;
  hasCompletedOnboarding: boolean;
}

export function OnboardingTour({ userId, hasCompletedOnboarding }: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Show tour only for users who haven't completed onboarding
    if (!hasCompletedOnboarding) {
      // Small delay so layout renders first
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  const updateTargetRect = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (isVisible) {
      const frame = requestAnimationFrame(updateTargetRect);
      window.addEventListener('resize', updateTargetRect);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', updateTargetRect);
      };
    }
  }, [isVisible, updateTargetRect]);

  const completeTour = useCallback(async () => {
    setIsVisible(false);
    // Mark onboarding as complete in the database
    try {
      await fetch('/api/user/onboarding-complete', { method: 'POST' });
    } catch {
      // Non-critical — just close the tour
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;

  // Calculate tooltip card position
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
        width: '340px',
        maxWidth: 'calc(100vw - 32px)',
      };
    }

    const scrollY = window.scrollY;
    const cardWidth = 340;
    const cardHeight = 200; // approx
    const margin = 16;

    // Try to position below the target
    let top = targetRect.bottom + scrollY + margin;
    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;

    // Keep within viewport
    if (left < margin) left = margin;
    if (left + cardWidth > window.innerWidth - margin) left = window.innerWidth - cardWidth - margin;

    return {
      position: 'absolute',
      top,
      left,
      zIndex: 10001,
      width: `${cardWidth}px`,
      maxWidth: 'calc(100vw - 32px)',
    };
  };

  const getHighlightStyle = (): React.CSSProperties | null => {
    if (!targetRect) return null;
    const padding = 8;
    return {
      position: 'fixed',
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
      borderRadius: '8px',
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
      border: '2px solid #c9a84c',
      zIndex: 10000,
      pointerEvents: 'none',
    };
  };

  const highlightStyle = getHighlightStyle();
  const cardStyle = getCardStyle();

  return (
    <>
      {/* Overlay (dimmed background when no specific target) */}
      {!targetRect && (
        <div
          className="fixed inset-0 bg-black/65 z-[9999]"
          onClick={completeTour}
          aria-hidden="true"
        />
      )}

      {/* Highlight ring around target element */}
      {highlightStyle && <div style={highlightStyle} aria-hidden="true" />}

      {/* Tour card */}
      <div style={cardStyle} role="dialog" aria-modal="true" aria-label="Знайомство з платформою">
        <div className="bg-panel-900 border-2 border-bronze rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line">
            <div className="flex items-center gap-3">
              <span className="font-syne font-bold text-bronze text-sm">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
              {/* Progress dots */}
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i <= currentStep ? 'bg-bronze' : 'bg-muted-500/40'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={completeTour}
              className="p-1 hover:bg-panel-850 rounded transition-colors"
              aria-label="Пропустити знайомство"
            >
              <X size={16} className="text-muted-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            <h3 className="font-syne font-bold text-text-100 text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-500 leading-relaxed">{step.description}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 pb-5">
            {!isFirst ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 text-sm text-muted-500 hover:text-text-100 transition-colors"
              >
                <ChevronLeft size={16} />
                Назад
              </button>
            ) : (
              <button
                onClick={completeTour}
                className="text-sm text-muted-500 hover:text-text-100 transition-colors"
              >
                Пропустити
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-bronze text-bg-950 px-5 py-2 rounded font-bold text-sm hover:bg-bronze/90 transition-colors"
            >
              {isLast ? 'Розпочати!' : 'Далі'}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
