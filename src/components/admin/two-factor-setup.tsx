'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onStatusChange?: () => void;
}

export function TwoFactorSetup({ isEnabled: initialEnabled, onStatusChange }: TwoFactorSetupProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [setupMode, setSetupMode] = useState(false);
  const [qrcodeUri, setQrcodeUri] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initialize 2FA');
      }

      const data = await response.json();
      setQrcodeUri(data.qrcodeUri);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setSetupMode(true);
    } catch (error) {
      console.error('2FA setup error:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося ініціалізувати 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Помилка',
        description: 'Введіть 6-значний код',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid code');
      }

      setIsEnabled(true);
      setSetupMode(false);
      toast({
        title: '2FA активовано',
        description: 'Двофакторна автентифікація успішно увімкнена',
      });

      onStatusChange?.();
    } catch (error) {
      console.error('2FA enable error:', error);
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Невірний код',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    const code = prompt('Введіть 6-значний код з вашого додатку для підтвердження:');
    if (!code) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid code');
      }

      setIsEnabled(false);
      toast({
        title: '2FA вимкнено',
        description: 'Двофакторна автентифікація вимкнена',
      });

      onStatusChange?.();
    } catch (error) {
      console.error('2FA disable error:', error);
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Невірний код',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопійовано',
      description: 'Текст скопійовано в буфер обміну',
    });
  };

  if (!setupMode && !isEnabled) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-timber-beam flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Двофакторна автентифікація</h3>
            <p className="text-sm text-timber-beam mb-4">
              Додайте додатковий рівень безпеки до вашого облікового запису за допомогою 2FA.
              Вам знадобиться додаток-автентифікатор (Google Authenticator, Authy, тощо).
            </p>
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Завантаження...' : 'Налаштувати 2FA'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          Налаштування 2FA
        </h3>

        <div className="space-y-6">
          {/* Step 1: Scan QR Code */}
          <div>
            <p className="font-bold mb-2">Крок 1: Скануйте QR-код</p>
            <p className="text-sm text-timber-beam mb-4">
              Відскануйте цей QR-код у вашому додатку-автентифікаторі:
            </p>
            <div className="bg-white p-4 inline-block border-2 border-timber-dark">
              <QRCodeSVG value={qrcodeUri} size={200} />
            </div>
          </div>

          {/* Manual Entry */}
          <div>
            <p className="text-sm text-timber-beam mb-2">
              Або введіть цей код вручну:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-timber-dark/10 px-4 py-2 font-mono text-sm border border-timber-dark/20">
                {secret}
              </code>
              <button
                onClick={() => copyToClipboard(secret)}
                className="btn btn-outline btn-sm"
                title="Копіювати"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step 2: Verify */}
          <div>
            <p className="font-bold mb-2">Крок 2: Підтвердіть налаштування</p>
            <p className="text-sm text-timber-beam mb-4">
              Введіть 6-значний код з додатку:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="flex-1 px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-2xl text-center focus:border-accent focus:outline-none"
              />
              <button
                onClick={handleEnable}
                disabled={loading || verificationCode.length !== 6}
                className="btn btn-primary"
              >
                {loading ? 'Перевірка...' : 'Підтвердити'}
              </button>
            </div>
          </div>

          {/* Backup Codes */}
          {backupCodes.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 mb-1">Резервні коди</p>
                  <p className="text-sm text-yellow-800 mb-3">
                    Збережіть ці коди в безпечному місці. Ви зможете використати їх для входу,
                    якщо втратите доступ до додатку-автентифікатору.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="bg-white px-3 py-2 text-sm font-mono border border-yellow-300">
                        {code}
                      </code>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                    className="text-sm font-bold text-yellow-700 hover:text-yellow-900 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Копіювати всі коди
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setSetupMode(false)}
            className="btn btn-outline"
          >
            Скасувати
          </button>
        </div>
      </div>
    );
  }

  // 2FA is enabled
  return (
    <div className="bg-canvas border-2 border-timber-dark p-6 relative">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">2FA активовано</h3>
          <p className="text-sm text-timber-beam mb-4">
            Ваш обліковий запис захищено двофакторною автентифікацією.
          </p>
          <button
            onClick={handleDisable}
            disabled={loading}
            className="btn btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
          >
            {loading ? 'Завантаження...' : 'Вимкнути 2FA'}
          </button>
        </div>
      </div>
    </div>
  );
}
