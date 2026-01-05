'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import Confetti from '@/components/ui/confetti';

interface MilestoneModalProps {
  milestone: {
    id: string;
    type: string;
    title: string;
    message: string;
  };
  onCelebrate: (milestoneId: string) => void;
}

/**
 * MilestoneModal component - celebrates milestone achievements
 * Shows confetti, milestone details, and celebration button
 */
export default function MilestoneModal({ milestone, onCelebrate }: MilestoneModalProps) {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleCelebrate = async () => {
    setIsCelebrating(true);
    try {
      const response = await fetch(`/api/user/milestones/${milestone.id}/celebrate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to celebrate milestone');
      }

      // Wait a moment for confetti animation
      setTimeout(() => {
        onCelebrate(milestone.id);
      }, 500);
    } catch (error) {
      console.error('[MilestoneModal] Celebration failed:', error);
      setIsCelebrating(false);
      alert('Не вдалося відзначити досягнення. Спробуйте ще раз.');
    }
  };

  return (
    <>
      {/* Confetti effect */}
      <Confetti trigger={true} />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-timber-dark/60 z-50 flex items-center justify-center p-4"
        onClick={handleCelebrate}
      >
        {/* Modal */}
        <div
          className="
            relative max-w-md w-full
            border-2 border-bronze bg-panel-900
            card-with-joints
            p-8
            animate-in fade-in zoom-in duration-300
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sparkles decoration */}
          <div className="absolute -top-3 -right-3">
            <Sparkles className="w-8 h-8 text-bronze animate-pulse" />
          </div>
          <div className="absolute -bottom-3 -left-3">
            <Sparkles className="w-8 h-8 text-bronze animate-pulse" />
          </div>

          {/* Content */}
          <div className="text-center">
            {/* Celebration icon */}
            <div className="text-6xl mb-4">
              {milestone.type === 'task_complete' && '✅'}
              {milestone.type === 'streak_milestone' && '🔥'}
              {milestone.type === 'achievement_earned' && '🏆'}
              {milestone.type === 'role_advance' && '⭐'}
            </div>

            {/* Title */}
            <h2 className="font-syne text-3xl font-bold text-bronze mb-4">
              {milestone.title}
            </h2>

            {/* Message */}
            <p className="font-mono text-lg text-timber-dark/90 mb-8">
              {milestone.message}
            </p>

            {/* Celebration button */}
            <button
              onClick={handleCelebrate}
              disabled={isCelebrating}
              className="
                inline-flex items-center justify-center gap-2
                px-8 py-4
                bg-bronze text-canvas
                font-mono text-base font-semibold
                border-2 border-bronze
                transition-all duration-200
                hover:bg-timber-dark hover:border-line
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isCelebrating ? 'Зачекайте...' : 'Чудово! 🎉'}
            </button>

            {/* Hint */}
            <p className="font-mono text-xs text-timber-dark/60 mt-4">
              Натисніть будь-де, щоб продовжити
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
