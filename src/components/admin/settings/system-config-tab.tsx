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
      <div className="border-2 border-timber-dark p-4 sm:p-8 bg-canvas relative">
        <div className="joint hidden sm:block" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint hidden sm:block" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint hidden sm:block" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint hidden sm:block" style={{ bottom: '-6px', right: '-6px' }} />

        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-4">Системна конфігурація</h2>
        <div className="p-8 border-2 border-accent bg-canvas/50 text-center">
          <p className="text-accent font-medium">
            ⚠️ Доступ заборонено
          </p>
          <p className="text-timber-beam text-sm mt-2">
            Тільки супер адміністратори можуть переглядати і редагувати системні налаштування
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-2 border-timber-dark p-8 bg-canvas relative flex items-center justify-center min-h-[400px]">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="border-2 border-timber-dark p-4 sm:p-8 bg-canvas relative">
      {/* Joints */}
      <div className="joint hidden sm:block" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint hidden sm:block" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint hidden sm:block" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint hidden sm:block" style={{ bottom: '-6px', right: '-6px' }} />

      <div className="mb-6">
        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2">Системна конфігурація</h2>
        <p className="text-timber-beam text-sm">
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
        <div className="space-y-4 pt-6 border-t-2 border-timber-dark">
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
        <div className="space-y-4 pt-6 border-t-2 border-timber-dark">
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

        {/* Save Button */}
        <div className="pt-6 border-t-2 border-timber-dark">
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

          <div className="mt-4 p-4 border-2 border-accent bg-canvas/50">
            <p className="text-sm text-accent">
              ⚠️ <strong>Увага:</strong> Зміни системних налаштувань вплинуть на всіх користувачів
              платформи. Будьте обережні при внесенні змін.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
