'use client';

import { useState, useEffect } from 'react';
import { AdminProfile } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2, MessageCircle, Users, Clock, Paperclip, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MEMBERSHIP_ROLES_UA } from '@/lib/constants';

interface MessagingSettingsTabProps {
  adminProfile: AdminProfile;
}

interface MessagingSettings {
  messaging_enabled: boolean;
  messaging_dm_enabled: boolean;
  messaging_group_chat_enabled: boolean;
  messaging_dm_initiator_roles: string[];
  messaging_group_creator_roles: string[];
  messaging_same_group_enabled: boolean;
  messaging_cross_group_enabled: boolean;
  messaging_attachments_enabled: boolean;
  messaging_max_attachment_size_mb: number;
  messaging_allowed_attachment_types: string[];
  messaging_rate_limit_messages_per_minute: number;
  messaging_max_group_participants: number;
  messaging_edit_window_minutes: number;
}

const MEMBERSHIP_ROLES = [
  'supporter',
  'candidate',
  'member',
  'honorary_member',
  'network_leader',
  'regional_leader',
  'national_leader',
  'network_guide',
] as const;

const ATTACHMENT_TYPES = [
  { value: 'image/jpeg', label: 'JPEG зображення' },
  { value: 'image/png', label: 'PNG зображення' },
  { value: 'image/gif', label: 'GIF анімації' },
  { value: 'image/webp', label: 'WebP зображення' },
  { value: 'application/pdf', label: 'PDF документи' },
  { value: 'application/msword', label: 'Word документи (.doc)' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word документи (.docx)' },
];

export default function MessagingSettingsTab({
  adminProfile,
}: MessagingSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MessagingSettings>({
    messaging_enabled: true,
    messaging_dm_enabled: true,
    messaging_group_chat_enabled: true,
    messaging_dm_initiator_roles: ['network_leader', 'regional_leader', 'national_leader', 'network_guide'],
    messaging_group_creator_roles: ['network_leader', 'regional_leader', 'national_leader', 'network_guide'],
    messaging_same_group_enabled: false,
    messaging_cross_group_enabled: false,
    messaging_attachments_enabled: true,
    messaging_max_attachment_size_mb: 10,
    messaging_allowed_attachment_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    messaging_rate_limit_messages_per_minute: 30,
    messaging_max_group_participants: 100,
    messaging_edit_window_minutes: 15,
  });

  const canEdit = adminProfile.role === 'super_admin';

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings/messaging');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching messaging settings:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити налаштування повідомлень',
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
      const response = await fetch('/api/admin/settings/messaging', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      toast({
        title: 'Збережено',
        description: 'Налаштування повідомлень оновлено',
      });
    } catch (error) {
      console.error('Error saving messaging settings:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося зберегти налаштування',
      });
    } finally {
      setSaving(false);
    }
  }

  function toggleRole(role: string, field: 'messaging_dm_initiator_roles' | 'messaging_group_creator_roles') {
    const current = settings[field];
    if (current.includes(role)) {
      setSettings({ ...settings, [field]: current.filter((r) => r !== role) });
    } else {
      setSettings({ ...settings, [field]: [...current, role] });
    }
  }

  function toggleAttachmentType(type: string) {
    const current = settings.messaging_allowed_attachment_types;
    if (current.includes(type)) {
      setSettings({ ...settings, messaging_allowed_attachment_types: current.filter((t) => t !== type) });
    } else {
      setSettings({ ...settings, messaging_allowed_attachment_types: [...current, type] });
    }
  }

  if (!canEdit) {
    return (
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Налаштування повідомлень
        </h2>
        <div className="p-8 border-2 border-bronze bg-panel-900/50 text-center">
          <p className="text-bronze font-medium">⚠️ Доступ заборонено</p>
          <p className="text-muted-500 text-sm mt-2">
            Тільки супер адміністратори можуть переглядати і редагувати налаштування повідомлень
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
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <div className="mb-6">
        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Налаштування повідомлень
        </h2>
        <p className="text-muted-500 text-sm">
          Керування системою особистих повідомлень та групових чатів
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Master Toggles */}
        <div className="space-y-4">
          <h3 className="font-syne font-bold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Основні налаштування
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="messaging_enabled"
                checked={settings.messaging_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, messaging_enabled: checked as boolean })
                }
              />
              <Label htmlFor="messaging_enabled" className="cursor-pointer font-medium">
                Система повідомлень увімкнена
              </Label>
            </div>

            <div className="flex items-center space-x-2 ml-6">
              <Checkbox
                id="dm_enabled"
                checked={settings.messaging_dm_enabled}
                disabled={!settings.messaging_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, messaging_dm_enabled: checked as boolean })
                }
              />
              <Label htmlFor="dm_enabled" className="cursor-pointer">
                Особисті повідомлення (DM)
              </Label>
            </div>

            <div className="flex items-center space-x-2 ml-6">
              <Checkbox
                id="group_enabled"
                checked={settings.messaging_group_chat_enabled}
                disabled={!settings.messaging_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, messaging_group_chat_enabled: checked as boolean })
                }
              />
              <Label htmlFor="group_enabled" className="cursor-pointer">
                Групові чати
              </Label>
            </div>
          </div>
        </div>

        {/* Permission Roles */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Дозволи за ролями
          </h3>

          {/* DM Initiator Roles */}
          <div className="space-y-2">
            <Label className="font-medium">
              Ролі, які можуть ініціювати особисті повідомлення:
            </Label>
            <p className="text-sm text-muted-500 mb-2">
              Оберіть ролі учасників, які можуть першими написати особисте повідомлення
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MEMBERSHIP_ROLES.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dm_${role}`}
                    checked={settings.messaging_dm_initiator_roles.includes(role)}
                    onCheckedChange={() => toggleRole(role, 'messaging_dm_initiator_roles')}
                  />
                  <Label htmlFor={`dm_${role}`} className="cursor-pointer text-sm">
                    {MEMBERSHIP_ROLES_UA[role]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Group Creator Roles */}
          <div className="space-y-2 mt-4">
            <Label className="font-medium">
              Ролі, які можуть створювати групові чати:
            </Label>
            <p className="text-sm text-muted-500 mb-2">
              Оберіть ролі учасників, які можуть створювати нові групові чати
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MEMBERSHIP_ROLES.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group_${role}`}
                    checked={settings.messaging_group_creator_roles.includes(role)}
                    onCheckedChange={() => toggleRole(role, 'messaging_group_creator_roles')}
                  />
                  <Label htmlFor={`group_${role}`} className="cursor-pointer text-sm">
                    {MEMBERSHIP_ROLES_UA[role]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Future Features */}
          <div className="mt-4 p-4 border-2 border-timber-beam/30 bg-panel-900/50">
            <p className="text-sm font-medium mb-2">Майбутні функції:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="same_group"
                  checked={settings.messaging_same_group_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, messaging_same_group_enabled: checked as boolean })
                  }
                />
                <Label htmlFor="same_group" className="cursor-pointer text-sm">
                  Учасники однієї групи можуть листуватися між собою
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cross_group"
                  checked={settings.messaging_cross_group_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, messaging_cross_group_enabled: checked as boolean })
                  }
                />
                <Label htmlFor="cross_group" className="cursor-pointer text-sm">
                  Учасники різних груп можуть листуватися між собою
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Вкладення
          </h3>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="attachments_enabled"
              checked={settings.messaging_attachments_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, messaging_attachments_enabled: checked as boolean })
              }
            />
            <Label htmlFor="attachments_enabled" className="cursor-pointer font-medium">
              Дозволити вкладення (файли, зображення)
            </Label>
          </div>

          {settings.messaging_attachments_enabled && (
            <>
              <div>
                <Label htmlFor="max_size">Максимальний розмір файлу (МБ)</Label>
                <Input
                  id="max_size"
                  type="number"
                  min={1}
                  max={100}
                  value={settings.messaging_max_attachment_size_mb}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messaging_max_attachment_size_mb: parseInt(e.target.value, 10) || 10,
                    })
                  }
                  className="mt-1 w-32"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Дозволені типи файлів:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ATTACHMENT_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type_${type.value}`}
                        checked={settings.messaging_allowed_attachment_types.includes(type.value)}
                        onCheckedChange={() => toggleAttachmentType(type.value)}
                      />
                      <Label htmlFor={`type_${type.value}`} className="cursor-pointer text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Limits */}
        <div className="space-y-4 pt-6 border-t-2 border-line">
          <h3 className="font-syne font-bold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Обмеження
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate_limit">Повідомлень на хвилину</Label>
              <Input
                id="rate_limit"
                type="number"
                min={1}
                max={100}
                value={settings.messaging_rate_limit_messages_per_minute}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    messaging_rate_limit_messages_per_minute: parseInt(e.target.value, 10) || 30,
                  })
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-500 mt-1">
                Максимальна кількість повідомлень від одного користувача за хвилину
              </p>
            </div>

            <div>
              <Label htmlFor="max_participants">Максимум учасників групи</Label>
              <Input
                id="max_participants"
                type="number"
                min={2}
                max={1000}
                value={settings.messaging_max_group_participants}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    messaging_max_group_participants: parseInt(e.target.value, 10) || 100,
                  })
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-500 mt-1">
                Максимальна кількість учасників в груповому чаті
              </p>
            </div>

            <div>
              <Label htmlFor="edit_window">Вікно редагування (хвилин)</Label>
              <Input
                id="edit_window"
                type="number"
                min={0}
                max={1440}
                value={settings.messaging_edit_window_minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    messaging_edit_window_minutes: parseInt(e.target.value, 10) || 15,
                  })
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-500 mt-1">
                Час протягом якого можна редагувати повідомлення (0 = заборонено)
              </p>
            </div>
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
              ⚠️ <strong>Увага:</strong> Зміни налаштувань повідомлень вплинуть на можливості
              комунікації всіх користувачів платформи.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
