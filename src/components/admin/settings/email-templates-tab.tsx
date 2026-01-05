'use client';

import { useState, useEffect } from 'react';
import { AdminProfile } from '@/lib/permissions';
import { isStaffAdmin } from '@/lib/permissions-utils';
import { Loader2, Mail, Edit, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailTemplatesTabProps {
  adminProfile: AdminProfile;
}

interface EmailTemplate {
  id: string;
  templateKey: string;
  name: string;
  description: string;
  subject: string;
  isActive: boolean;
  version: number;
  updatedAt: string;
  lastSentAt: string | null;
}

export default function EmailTemplatesTab({
  adminProfile,
}: EmailTemplatesTabProps) {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [testingTemplate, setTestingTemplate] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const canEdit = isStaffAdmin(adminProfile.staff_role);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/admin/email-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити шаблони',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTest(templateKey: string) {
    if (!testEmail) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Введіть email для тестового листа',
      });
      return;
    }

    setTestingTemplate(templateKey);
    try {
      const response = await fetch(`/api/admin/email-templates/${templateKey}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });

      if (!response.ok) throw new Error('Failed to send test email');

      toast({
        title: 'Відправлено',
        description: `Тестовий лист надіслано на ${testEmail}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося надіслати тестовий лист',
      });
    } finally {
      setTestingTemplate(null);
    }
  }

  if (!canEdit) {
    return (
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-4">Email шаблони</h2>
        <div className="p-8 border-2 border-bronze bg-panel-900/50 text-center">
          <p className="text-bronze font-medium">
            ⚠️ Доступ заборонено
          </p>
          <p className="text-muted-500 text-sm mt-2">
            Тільки адміністратори можуть переглядати і редагувати email шаблони
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
        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2">Email шаблони</h2>
        <p className="text-muted-500 text-sm">
          Управління шаблонами автоматичних листів системи
        </p>
      </div>

      {/* Test Email Input */}
      <div className="mb-6 p-4 border border-line rounded-lg bg-panel-900">
        <Label htmlFor="test-email" className="block mb-2">
          Email для тестових листів
        </Label>
        <Input
          id="test-email"
          type="email"
          placeholder="your-email@example.com"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="max-w-md"
        />
        <p className="text-xs text-muted-500 mt-1">
          Введіть email, на який будуть надсилатися тестові листи
        </p>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border border-line rounded-lg p-4 bg-panel-900 card-with-joints"
          >
            {/* Joints */}
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Template Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-bronze" />
                  <h3 className="font-syne font-bold text-lg">{template.name}</h3>
                  {template.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>

                <p className="text-muted-500 text-sm mb-2">{template.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-500">
                  <span>
                    <strong>Ключ:</strong> {template.templateKey}
                  </span>
                  <span>
                    <strong>Версія:</strong> {template.version}
                  </span>
                  <span>
                    <strong>Оновлено:</strong>{' '}
                    {new Date(template.updatedAt).toLocaleDateString('uk-UA')}
                  </span>
                  {template.lastSentAt && (
                    <span>
                      <strong>Останній лист:</strong>{' '}
                      {new Date(template.lastSentAt).toLocaleDateString('uk-UA')}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm">
                  <strong>Тема:</strong> {template.subject}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:w-auto w-full">
                <Link
                  href={`/admin/settings/email-templates/${template.templateKey}/edit`}
                  className="btn btn-outline inline-flex items-center gap-2 justify-center"
                >
                  <Edit className="w-4 h-4" />
                  Редагувати
                </Link>

                <button
                  onClick={() => handleSendTest(template.templateKey)}
                  disabled={testingTemplate === template.templateKey || !testEmail}
                  className="btn btn-primary inline-flex items-center gap-2 justify-center"
                >
                  {testingTemplate === template.templateKey ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Відправка...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Тест
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 border-2 border-bronze bg-panel-900/50">
        <p className="text-sm text-bronze">
          💡 <strong>Порада:</strong> Шаблони використовують систему змінних{' '}
          <code className="bg-timber-dark text-canvas px-1">{'{{variable}}'}</code>.
          Відредагуйте шаблон, щоб побачити доступні змінні для кожного типу листа.
        </p>
      </div>
    </div>
  );
}
