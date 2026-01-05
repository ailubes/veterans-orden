'use client';

import { useState } from 'react';
import { X, Download, Trophy } from 'lucide-react';
import Confetti from '@/components/ui/confetti';

interface AchievementModalProps {
  achievement: {
    id: string;
    key: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
  };
  onClose: () => void;
}

/**
 * AchievementModal component - displays achievement details with confetti
 * Shows trophy, title, description, date, and download button for certificate
 */
export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/user/achievements/${achievement.id}/badge`);
      if (!response.ok) throw new Error('Failed to download badge');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dosyagnennya-${achievement.key}.svg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('[AchievementModal] Download failed:', error);
      alert('Не вдалося завантажити сертифікат. Спробуйте ще раз.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Confetti effect */}
      <Confetti trigger={true} />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-panel-850/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="
            relative max-w-lg w-full
            border border-line rounded-lg bg-panel-900
            card-with-joints
            p-8
            animate-in fade-in zoom-in duration-300
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="
              absolute top-4 right-4
              w-8 h-8
              flex items-center justify-center
              text-text-100/60 hover:text-text-100
              transition-colors
            "
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Trophy icon */}
            <div className="
              inline-flex items-center justify-center
              w-20 h-20
              bg-bronze/10
              border-2 border-bronze
              rounded-full
              mb-6
            ">
              <Trophy className="w-10 h-10 text-bronze" />
            </div>

            {/* Title */}
            <h2 className="font-syne text-3xl font-bold text-text-100 mb-3">
              {achievement.title}
            </h2>

            {/* Description */}
            <p className="font-mono text-base text-text-100/80 mb-6">
              {achievement.description}
            </p>

            {/* Date */}
            <div className="inline-block px-4 py-2 bg-panel-850/5 border border-line/20 mb-8">
              <span className="font-mono text-sm text-text-100/60">
                Отримано: {formatDate(achievement.earnedAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="
                  inline-flex items-center justify-center gap-2
                  px-6 py-3
                  bg-bronze text-canvas
                  font-mono text-sm font-semibold
                  border-2 border-bronze
                  transition-all duration-200
                  hover:bg-panel-850 hover:border-line
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Завантаження...' : 'Завантажити сертифікат'}
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="
                  inline-flex items-center justify-center gap-2
                  px-6 py-3
                  bg-panel-900 text-text-100
                  font-mono text-sm font-semibold
                  border border-line rounded-lg
                  transition-all duration-200
                  hover:bg-panel-850/5
                "
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
