'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Share2, Download, QrCode } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface ReferralClientProps {
  referralCode: string;
}

export function ReferralClient({ referralCode }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use old format: /signup/{code}
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup/${referralCode}`;

  useEffect(() => {
    if (showQR && referralCode) {
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQR, referralCode]);

  const generateQRCode = async () => {
    try {
      const url = await QRCodeLib.toDataURL(referralLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#54616A', // timber-dark
          light: '#F5F1E8', // canvas
        },
      });
      setQrCodeUrl(url);

      // Also draw on canvas for download
      if (canvasRef.current) {
        await QRCodeLib.toCanvas(canvasRef.current, referralLink, {
          width: 512,
          margin: 2,
          color: {
            dark: '#54616A',
            light: '#F5F1E8',
          },
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

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

  const handleDownloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `merezha-referral-${referralCode}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  if (!referralCode) {
    return (
      <div className="bg-panel-850 text-canvas p-6 lg:p-8 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="text-center py-4">
          Завершіть онбординг, щоб отримати ваше запрошувальне посилання
        </p>
      </div>
    );
  }

  return (
    <div className="bg-panel-850 text-canvas p-6 lg:p-8 relative mb-8">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <p className="label text-bronze mb-4">ТВОЄ ЗАПРОШУВАЛЬНЕ ПОСИЛАННЯ</p>

      <div className="flex flex-col gap-4 mb-6">
        {/* Link Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-panel-900/10 p-4 font-mono text-sm break-all">
            {referralLink}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-bronze text-canvas px-6 py-3 font-bold text-sm hover:bg-bronze/90 transition-colors min-w-[140px]"
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
                className="flex items-center justify-center gap-2 bg-panel-900/10 text-canvas px-4 py-3 font-bold text-sm hover:bg-panel-900/20 transition-colors"
                aria-label="Поділитися"
              >
                <Share2 size={18} />
              </button>
            )}
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-center gap-2 bg-panel-900/10 text-canvas px-4 py-3 font-bold text-sm hover:bg-panel-900/20 transition-colors"
              aria-label="QR код"
            >
              <QrCode size={18} />
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="bg-panel-900/10 p-6 flex flex-col items-center gap-4">
            {qrCodeUrl && (
              <div className="bg-panel-900 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 bg-bronze text-canvas px-6 py-3 font-bold text-sm hover:bg-bronze/90 transition-colors"
            >
              <Download size={18} />
              ЗАВАНТАЖИТИ QR КОД
            </button>
            <p className="text-xs text-center opacity-70">
              Скануйте цей QR-код, щоб перейти на сторінку реєстрації
            </p>
          </div>
        )}

        {/* Hidden canvas for high-res download */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <p className="text-sm opacity-80">
        Поділіться цим посиланням або QR-кодом з друзями. За кожного нового
        члена ви отримаєте бали!
      </p>
    </div>
  );
}
