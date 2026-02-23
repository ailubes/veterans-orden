'use client';

import { useState, useEffect } from 'react';
import { AdminProfile } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemConfigTabProps {
  adminProfile: AdminProfile;
}

interface SystemConfig {
  system_maintenance_mode: boolean;
  system_registration_enabled: boolean;
  system_default_membership_tier: string;
  system_voting_enabled: boolean;
  system_events_enabled: boolean;
  system_tasks_enabled: boolean;
  system_challenges_enabled: boolean;
  points_event_attendance: number;
  points_vote_cast: number;
  points_task_completion: number;
  points_referral: number;
  points_challenge_win: number;
  // Payment settings
  payment_liqpay_enabled: boolean;
  payment_liqpay_public_key: string;
  payment_liqpay_private_key: string;
  payment_liqpay_sandbox_mode: boolean;
  payment_currency: string;
  payment_success_bonus_points: number;
  // PUMB payment settings
  payment_pumb_enabled: boolean;
  payment_pumb_client_id: string;
  payment_pumb_client_secret: string;
  payment_pumb_api_url: string;
  payment_pumb_portal_id: string;
  payment_pumb_merchant_id: string;
  // HUTKO payment settings
  payment_hutko_enabled: boolean;
  payment_hutko_merchant_id: string;
  payment_hutko_secret_key: string;
  payment_hutko_credit_key: string;
}

export default function SystemConfigTab({
  adminProfile,
}: SystemConfigTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    system_maintenance_mode: false,
    system_registration_enabled: true,
    system_default_membership_tier: 'basic_49',
    system_voting_enabled: true,
    system_events_enabled: true,
    system_tasks_enabled: true,
    system_challenges_enabled: true,
    points_event_attendance: 10,
    points_vote_cast: 5,
    points_task_completion: 20,
    points_referral: 50,
    points_challenge_win: 100,
    // Payment settings
    payment_liqpay_enabled: true,
    payment_liqpay_public_key: '',
    payment_liqpay_private_key: '',
    payment_liqpay_sandbox_mode: true,
    payment_currency: 'UAH',
    payment_success_bonus_points: 50,
    // PUMB
    payment_pumb_enabled: false,
    payment_pumb_client_id: '',
    payment_pumb_client_secret: '',
    payment_pumb_api_url: '',
    payment_pumb_portal_id: '',
    payment_pumb_merchant_id: '',
    // HUTKO
    payment_hutko_enabled: false,
    payment_hutko_merchant_id: '',
    payment_hutko_secret_key: '',
    payment_hutko_credit_key: '',
  });

  const canEdit = adminProfile.role === 'super_admin';

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const response = await fetch('/api/admin/settings/system');
      if (!response.ok) throw new Error('Failed to fetch config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити конфігурацію',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/system', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Failed to save config');

      toast({
        title: 'Збережено',
        description: 'Системні налаштування оновлено',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося зберегти конфігурацію',
      });
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) {
    return (
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-4">Системна конфігурація</h2>
        <div className="p-8 border-2 border-bronze bg-panel-900/50 text-center">
          <p className="text-bronze font-medium">
            ⚠️ Доступ заборонено
          </p>
          <p className="text-muted-500 text-sm mt-2">
            Тільки супер адміністратори можуть переглядати і редагувати системні налаштування
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />
        <Loader2 className="w-8 h-8 animate-spin text-bronze" />
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
      {/* Joints */}
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <div className="mb-6">
        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2">Системна конфігурація</h2>
        <p className="text-muted-500 text-sm">
          Глобальні налаштування системи (доступно тільки супер адміністраторам)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* System Settings */}
        <div className="space-y-4">
          <h3 className="font-syne font-bold text-lg">Системні налаштування</h3>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="maintenance"
              checked={config.system_maintenance_mode}
              onCheckedChange={(checked) =>
                setConfig({ ...config, system_maintenance_mode: checked as boolean })
              }
            />
            <Label htmlFor="maintenance" className="cursor-pointer">
              Режим обслуговування (закриває доступ до сайту для звичайних користувачів)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="registration"
              checked={config.system_registration_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, system_registration_enabled: checked as boolean })
              }
            />
            <Label htmlFor="registration" className="cursor-pointer">
              Реєстрація увімкнена (дозволити нові реєстрації)
            </Label>
          </div>

          <div>
            <Label htmlFor="default_tier">Стандартний рівень членства</Label>
            <Select
              value={config.system_default_membership_tier}
              onValueChange={(value) =>
                setConfig({ ...config, system_default_membership_tier: value })
              }
            >
              <SelectTrigger id="default_tier" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic_49">Базовий (49 грн)</SelectItem>
                <SelectItem value="supporter_100">Підтримка (100 грн)</SelectItem>
                <SelectItem value="supporter_200">Підтримка+ (200 грн)</SelectItem>
                <SelectItem value="patron_500">Меценат (500 грн)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg">Функції платформи</h3>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="voting"
              checked={config.system_voting_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, system_voting_enabled: checked as boolean })
              }
            />
            <Label htmlFor="voting" className="cursor-pointer">
              Голосування увімкнено
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="events"
              checked={config.system_events_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, system_events_enabled: checked as boolean })
              }
            />
            <Label htmlFor="events" className="cursor-pointer">
              Події увімкнено
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="tasks"
              checked={config.system_tasks_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, system_tasks_enabled: checked as boolean })
              }
            />
            <Label htmlFor="tasks" className="cursor-pointer">
              Завдання увімкнено
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="challenges"
              checked={config.system_challenges_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, system_challenges_enabled: checked as boolean })
              }
            />
            <Label htmlFor="challenges" className="cursor-pointer">
              Челенджі увімкнено
            </Label>
          </div>
        </div>

        {/* Points Configuration */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg">Нарахування балів</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="points_event">Відвідування події</Label>
              <Input
                id="points_event"
                type="number"
                value={config.points_event_attendance}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    points_event_attendance: parseInt(e.target.value, 10),
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="points_vote">Участь у голосуванні</Label>
              <Input
                id="points_vote"
                type="number"
                value={config.points_vote_cast}
                onChange={(e) =>
                  setConfig({ ...config, points_vote_cast: parseInt(e.target.value, 10) })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="points_task">Виконання завдання</Label>
              <Input
                id="points_task"
                type="number"
                value={config.points_task_completion}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    points_task_completion: parseInt(e.target.value, 10),
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="points_referral">Успішний реферал</Label>
              <Input
                id="points_referral"
                type="number"
                value={config.points_referral}
                onChange={(e) =>
                  setConfig({ ...config, points_referral: parseInt(e.target.value, 10) })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="points_challenge">Перемога в челенджі</Label>
              <Input
                id="points_challenge"
                type="number"
                value={config.points_challenge_win}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    points_challenge_win: parseInt(e.target.value, 10),
                  })
                }
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg">Налаштування платежів (LiqPay)</h3>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="payment_enabled"
              checked={config.payment_liqpay_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, payment_liqpay_enabled: checked as boolean })
              }
            />
            <Label htmlFor="payment_enabled" className="cursor-pointer">
              Прийом платежів увімкнено
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="payment_sandbox"
              checked={config.payment_liqpay_sandbox_mode}
              onCheckedChange={(checked) =>
                setConfig({ ...config, payment_liqpay_sandbox_mode: checked as boolean })
              }
            />
            <Label htmlFor="payment_sandbox" className="cursor-pointer">
              Тестовий режим (sandbox) - вимкніть для продакшн платежів
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="liqpay_public_key">
                LiqPay Public Key <span className="text-red-600">*</span>
              </Label>
              <Input
                id="liqpay_public_key"
                type="text"
                value={config.payment_liqpay_public_key}
                onChange={(e) =>
                  setConfig({ ...config, payment_liqpay_public_key: e.target.value })
                }
                placeholder="sandbox_i12345678"
                className="mt-1 font-mono text-xs"
              />
              <p className="text-xs text-muted-500 mt-1">
                Отримайте на{' '}
                <a
                  href="https://www.liqpay.ua/uk/adminbusiness"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bronze hover:underline"
                >
                  liqpay.ua
                </a>
              </p>
            </div>

            <div>
              <Label htmlFor="liqpay_private_key">
                LiqPay Private Key <span className="text-red-600">*</span>
              </Label>
              <Input
                id="liqpay_private_key"
                type="password"
                value={config.payment_liqpay_private_key}
                onChange={(e) =>
                  setConfig({ ...config, payment_liqpay_private_key: e.target.value })
                }
                placeholder="••••••••••••••••"
                className="mt-1 font-mono text-xs"
              />
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Тримайте в секреті! Не діліться ніким.
              </p>
            </div>

            <div>
              <Label htmlFor="payment_currency">Валюта платежів</Label>
              <Select
                value={config.payment_currency}
                onValueChange={(value) =>
                  setConfig({ ...config, payment_currency: value })
                }
              >
                <SelectTrigger id="payment_currency" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UAH">UAH (Гривня)</SelectItem>
                  <SelectItem value="USD">USD (Долар)</SelectItem>
                  <SelectItem value="EUR">EUR (Євро)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_bonus">Бонусні бали за перший платіж</Label>
              <Input
                id="payment_bonus"
                type="number"
                value={config.payment_success_bonus_points}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment_success_bonus_points: parseInt(e.target.value, 10),
                  })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="p-4 border-2 border-blue-300 bg-blue-50">
            <p className="text-sm text-blue-800">
              💡 <strong>Як налаштувати LiqPay:</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal space-y-1">
              <li>Зареєструйтесь на <a href="https://www.liqpay.ua/" target="_blank" rel="noopener" className="underline">liqpay.ua</a></li>
              <li>Увійдіть в кабінет → Налаштування → API</li>
              <li>Скопіюйте Public Key та Private Key</li>
              <li>Вставте ключі в поля вище</li>
              <li>Для тестування використовуйте sandbox режим</li>
              <li>Після перевірки вимкніть sandbox для прийому реальних платежів</li>
            </ol>
          </div>
        </div>

        {/* PUMB Payment Settings */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg">Налаштування платежів (PUMB PayHub2)</h3>
          <p className="text-sm text-muted-500">
            PUMB є альтернативним провайдером платежів. Увімкніть і заповніть облікові дані, щоб перемкнути систему на PUMB.
            LiqPay залишається активним, поки PUMB не увімкнено.
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pumb_enabled"
              checked={config.payment_pumb_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, payment_pumb_enabled: checked as boolean })
              }
            />
            <Label htmlFor="pumb_enabled" className="cursor-pointer">
              Увімкнути PUMB як активний провайдер платежів
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pumb_client_id">PUMB Client ID</Label>
              <Input
                id="pumb_client_id"
                type="text"
                value={config.payment_pumb_client_id}
                onChange={(e) => setConfig({ ...config, payment_pumb_client_id: e.target.value })}
                placeholder="client_id"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <Label htmlFor="pumb_client_secret">PUMB Client Secret</Label>
              <Input
                id="pumb_client_secret"
                type="password"
                value={config.payment_pumb_client_secret}
                onChange={(e) => setConfig({ ...config, payment_pumb_client_secret: e.target.value })}
                placeholder="••••••••••••"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="pumb_api_url">PUMB API URL</Label>
              <Input
                id="pumb_api_url"
                type="text"
                value={config.payment_pumb_api_url}
                onChange={(e) => setConfig({ ...config, payment_pumb_api_url: e.target.value })}
                placeholder="https://api.pumb.ua/payhub2"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <Label htmlFor="pumb_portal_id">PUMB Portal ID</Label>
              <Input
                id="pumb_portal_id"
                type="text"
                value={config.payment_pumb_portal_id}
                onChange={(e) => setConfig({ ...config, payment_pumb_portal_id: e.target.value })}
                placeholder="portal_id"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <Label htmlFor="pumb_merchant_id">PUMB Merchant ID</Label>
              <Input
                id="pumb_merchant_id"
                type="text"
                value={config.payment_pumb_merchant_id}
                onChange={(e) => setConfig({ ...config, payment_pumb_merchant_id: e.target.value })}
                placeholder="merchant_id"
                className="mt-1 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-4 border-2 border-bronze bg-panel-900/50">
            <p className="text-sm text-bronze">
              ⚠️ <strong>Увага:</strong> Переконайтеся, що всі поля PUMB заповнені перед увімкненням.
              Webhook URL для PUMB: <code className="text-xs bg-panel-850 px-1 py-0.5 rounded">/api/payments/pumb-callback</code>
            </p>
          </div>
        </div>

        {/* HUTKO Payment Settings */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg">Налаштування платежів (HUTKO)</h3>
          <p className="text-sm text-muted-500">
            HUTKO є основним провайдером платежів (Fondy-based).
            Заповніть облікові дані та увімкніть для прийому платежів.
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hutko_enabled"
              checked={config.payment_hutko_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, payment_hutko_enabled: checked as boolean })
              }
            />
            <Label htmlFor="hutko_enabled" className="cursor-pointer">
              Увімкнути HUTKO
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hutko_merchant_id">Merchant ID</Label>
              <Input
                id="hutko_merchant_id"
                type="number"
                value={config.payment_hutko_merchant_id}
                onChange={(e) => setConfig({ ...config, payment_hutko_merchant_id: e.target.value })}
                placeholder="1702303"
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>{/* spacer */}</div>
            <div>
              <Label htmlFor="hutko_secret_key">Ключ оплати (Payment Key)</Label>
              <Input
                id="hutko_secret_key"
                type="password"
                value={config.payment_hutko_secret_key}
                onChange={(e) => setConfig({ ...config, payment_hutko_secret_key: e.target.value })}
                placeholder="••••••••••••••••"
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label htmlFor="hutko_credit_key">Кредитний ключ (Credit Key)</Label>
              <Input
                id="hutko_credit_key"
                type="password"
                value={config.payment_hutko_credit_key}
                onChange={(e) => setConfig({ ...config, payment_hutko_credit_key: e.target.value })}
                placeholder="••••••••••••••••"
                className="mt-1 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-4 border-2 border-bronze bg-panel-900/50">
            <p className="text-sm text-bronze">
              ⚠️ <strong>Увага:</strong> Callback URL для HUTKO:{' '}
              <code className="text-xs bg-panel-850 px-1 py-0.5 rounded">/api/payments/hutko-callback</code>
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t-2 border-line">
          <button type="submit" disabled={saving} className="btn inline-flex items-center gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Збереження...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Зберегти зміни
              </>
            )}
          </button>

          <div className="mt-4 p-4 border-2 border-bronze bg-panel-900/50">
            <p className="text-sm text-bronze">
              ⚠️ <strong>Увага:</strong> Зміни системних налаштувань вплинуть на всіх користувачів
              платформи. Будьте обережні при внесенні змін.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
