'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface ReferralClientProps {
  referralCode: string;
}

export function ReferralClient({ referralCode }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/sign-up?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Приєднуйся до Мережі Вільних Людей',
          text: 'Приєднуйся до Мережі Вільних Людей — громадянської мережі політичного впливу!',
          url: referralLink,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  if (!referralCode) {
    return (
      <div className="bg-timber-dark text-canvas p-6 lg:p-8 relative mb-8">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="text-center py-4">
          Завершіть онбординг, щоб отримати ваше запрошувальне посилання
        </p>
      </div>
    );
  }

  return (
    <div className="bg-timber-dark text-canvas p-6 lg:p-8 relative mb-8">
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

      <p className="label text-accent mb-4">ТВОЄ ЗАПРОШУВАЛЬНЕ ПОСИЛАННЯ</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 bg-canvas/10 p-4 font-mono text-sm break-all">
          {referralLink}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 bg-accent text-canvas px-6 py-3 font-bold text-sm hover:bg-accent/90 transition-colors min-w-[140px]"
          >
            {copied ? (
              <>
                <Check size={18} />
                СКОПІЙОВАНО
              </>
            ) : (
              <>
                <Copy size={18} />
                КОПІЮВАТИ
              </>
            )}
          </button>
          {'share' in navigator && (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-canvas/10 text-canvas px-4 py-3 font-bold text-sm hover:bg-canvas/20 transition-colors"
              aria-label="Поділитися"
            >
              <Share2 size={18} />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm opacity-80">
        Поділіться цим посиланням з друзями. За кожного нового члена ви отримаєте
        бали!
      </p>
    </div>
  );
}
