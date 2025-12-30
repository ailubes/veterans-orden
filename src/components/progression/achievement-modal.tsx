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
        className="fixed inset-0 bg-timber-dark/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="
            relative max-w-lg w-full
            border-2 border-timber-dark bg-canvas
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
              text-timber-dark/60 hover:text-timber-dark
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
              bg-accent/10
              border-2 border-accent
              rounded-full
              mb-6
            ">
              <Trophy className="w-10 h-10 text-accent" />
            </div>

            {/* Title */}
            <h2 className="font-syne text-3xl font-bold text-timber-dark mb-3">
              {achievement.title}
            </h2>

            {/* Description */}
            <p className="font-mono text-base text-timber-dark/80 mb-6">
              {achievement.description}
            </p>

            {/* Date */}
            <div className="inline-block px-4 py-2 bg-timber-dark/5 border border-timber-dark/20 mb-8">
              <span className="font-mono text-sm text-timber-dark/60">
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
                  bg-accent text-canvas
                  font-mono text-sm font-semibold
                  border-2 border-accent
                  transition-all duration-200
                  hover:bg-timber-dark hover:border-timber-dark
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
                  bg-canvas text-timber-dark
                  font-mono text-sm font-semibold
                  border-2 border-timber-dark
                  transition-all duration-200
                  hover:bg-timber-dark/5
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
