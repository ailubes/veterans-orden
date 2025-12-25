'use client';

import { useState, useEffect } from 'react';
import { AdminProfile } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrganizationProfileTabProps {
  adminProfile: AdminProfile;
}

interface OrganizationSettings {
  organization_name: string;
  organization_contact_email: string;
  organization_contact_phone: string;
  organization_about: string;
  organization_social_facebook: string;
  organization_social_telegram: string;
  organization_social_youtube: string;
  organization_social_twitter: string;
}

export default function OrganizationProfileTab({
  adminProfile,
}: OrganizationProfileTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OrganizationSettings>({
    organization_name: '',
    organization_contact_email: '',
    organization_contact_phone: '',
    organization_about: '',
    organization_social_facebook: '',
    organization_social_telegram: '',
    organization_social_youtube: '',
    organization_social_twitter: '',
  });

  const isReadOnly = adminProfile.role === 'regional_leader';

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings/organization');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити налаштування',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isReadOnly) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({
        title: 'Збережено',
        description: 'Налаштування організації оновлено',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося зберегти налаштування',
      });
    } finally {
      setSaving(false);
    }
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
        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2">Профіль організації</h2>
        <p className="text-timber-beam text-sm">
          Інформація про організацію, яка відображається на публічних сторінках
        </p>
        {isReadOnly && (
          <div className="mt-4 p-4 border-2 border-accent bg-canvas/50">
            <p className="text-sm text-accent">
              ⚠️ Ви можете лише переглядати ці налаштування. Редагування доступне тільки для адміністраторів.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-syne font-bold text-lg">Основна інформація</h3>

          <div>
            <Label htmlFor="org_name">Назва організації</Label>
            <Input
              id="org_name"
              value={settings.organization_name}
              onChange={(e) =>
                setSettings({ ...settings, organization_name: e.target.value })
              }
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="org_email">Контактний email</Label>
            <Input
              id="org_email"
              type="email"
              value={settings.organization_contact_email}
              onChange={(e) =>
                setSettings({ ...settings, organization_contact_email: e.target.value })
              }
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="org_phone">Контактний телефон</Label>
            <Input
              id="org_phone"
              value={settings.organization_contact_phone}
              onChange={(e) =>
                setSettings({ ...settings, organization_contact_phone: e.target.value })
              }
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="org_about">Опис організації</Label>
            <Textarea
              id="org_about"
              value={settings.organization_about}
              onChange={(e) =>
                setSettings({ ...settings, organization_about: e.target.value })
              }
              disabled={isReadOnly}
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-timber-beam mt-1">
              Короткий опис вашої організації для публічних сторінок
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-6 border-t-2 border-timber-dark">
          <h3 className="font-syne font-bold text-lg">Соціальні мережі</h3>

          <div>
            <Label htmlFor="social_facebook">Facebook</Label>
            <Input
              id="social_facebook"
              type="url"
              placeholder="https://facebook.com/your-page"
              value={settings.organization_social_facebook}
              onChange={(e) =>
                setSettings({ ...settings, organization_social_facebook: e.target.value })
              }
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="social_telegram">Telegram</Label>
            <Input
              id="social_telegram"
              type="url"
              placeholder="https://t.me/your-channel"
              value={settings.organization_social_telegram}
              onChange={(e) =>
                setSettings({ ...settings, organization_social_telegram: e.target.value })
              }
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="social_youtube">YouTube</Label>
            <Input
              id="social_youtube"
              type="url"
              placeholder="https://youtube.com/@your-channel"
              value={settings.organization_social_youtube}
              onChange={(e) =>
                setSettings({ ...settings, organization_social_youtube: e.target.value })
              }
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="social_twitter">Twitter/X</Label>
            <Input
              id="social_twitter"
              type="url"
              placeholder="https://x.com/your-account"
              value={settings.organization_social_twitter}
              onChange={(e) =>
                setSettings({ ...settings, organization_social_twitter: e.target.value })
              }
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>
        </div>

        {/* Save Button */}
        {!isReadOnly && (
          <div className="pt-6 border-t-2 border-timber-dark">
            <button
              type="submit"
              disabled={saving}
              className="btn inline-flex items-center gap-2"
            >
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
          </div>
        )}
      </form>
    </div>
  );
}
