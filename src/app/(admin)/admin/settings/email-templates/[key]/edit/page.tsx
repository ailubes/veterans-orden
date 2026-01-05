'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Info, History, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  templateKey: string;
  name: string;
  description: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  availableVariables: string[];
  variableDescriptions: Record<string, string>;
  previewData: Record<string, string>;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastSentAt: string | null;
  history: HistoryEntry[];
}

interface HistoryEntry {
  id: string;
  version: number;
  subject: string;
  htmlContent: string;
  textContent: string;
  changedAt: string;
  changeReason: string;
  changedBy: { first_name: string; last_name: string };
}

export default function EmailTemplateEditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    htmlContent: '',
    textContent: '',
    isActive: true,
    changeReason: '',
  });

  useEffect(() => {
    fetchTemplate();
  }, [key]);

  async function fetchTemplate() {
    try {
      const response = await fetch(`/api/admin/email-templates/${key}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();

      setTemplate(data.template);
      setFormData({
        subject: data.template.subject,
        htmlContent: data.template.htmlContent,
        textContent: data.template.textContent || '',
        isActive: data.template.isActive,
        changeReason: '',
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити шаблон',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/email-templates/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save template');

      toast({
        title: 'Збережено',
        description: 'Шаблон email оновлено успішно',
      });

      // Refresh data
      await fetchTemplate();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося зберегти шаблон',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="border border-line rounded-lg p-8 bg-panel-900 card-with-joints flex items-center justify-center min-h-[400px]">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />
          <Loader2 className="w-8 h-8 animate-spin text-bronze" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="border border-line rounded-lg p-8 bg-panel-900 card-with-joints text-center">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />
          <p className="text-bronze font-medium">Шаблон не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/settings?tab=email-templates"
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до налаштувань
        </Link>
        <p className="label text-bronze mb-2">РЕДАГУВАННЯ ШАБЛОНУ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          {template.name}
        </h1>
        <p className="text-muted-500 mt-2">{template.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-500 mt-2">
          <span>
            <strong>Версія:</strong> {template.version}
          </span>
          <span>
            <strong>Оновлено:</strong>{' '}
            {new Date(template.updatedAt).toLocaleDateString('uk-UA')}
          </span>
        </div>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0 mb-8">
          <TabsTrigger
            value="edit"
            className="border border-line rounded-lg bg-panel-900 text-text-100 font-bold data-[state=active]:bg-panel-850 data-[state=active]:text-canvas h-12 px-4"
          >
            Редагувати
          </TabsTrigger>
          <TabsTrigger
            value="variables"
            className="border border-line rounded-lg bg-panel-900 text-text-100 font-bold data-[state=active]:bg-panel-850 data-[state=active]:text-canvas h-12 px-4"
          >
            Змінні
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="border border-line rounded-lg bg-panel-900 text-text-100 font-bold data-[state=active]:bg-panel-850 data-[state=active]:text-canvas h-12 px-4"
          >
            Історія
          </TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="mt-0">
          <form onSubmit={handleSubmit}>
            <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />
              <div className="joint joint-bl" />
              <div className="joint joint-br" />

              <div className="space-y-6">
                {/* Subject */}
                <div>
                  <Label htmlFor="subject">Тема листа</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-muted-500 mt-1">
                    Використовуйте змінні у форматі{' '}
                    <code className="bg-panel-850 text-canvas px-1">
                      {'{{variable}}'}
                    </code>
                  </p>
                </div>

                {/* HTML Content */}
                <div>
                  <Label htmlFor="html-content">HTML контент</Label>
                  <div className="mt-1 border border-line rounded-lg rounded">
                    <RichTextEditor
                      content={formData.htmlContent}
                      onChange={(html) =>
                        setFormData({ ...formData, htmlContent: html })
                      }
                      placeholder="Введіть HTML контент email..."
                      minHeight="400px"
                    />
                  </div>
                  <p className="text-xs text-muted-500 mt-1">
                    Використовуйте змінні у форматі{' '}
                    <code className="bg-panel-850 text-canvas px-1">
                      {'{{variable}}'}
                    </code>
                  </p>
                </div>

                {/* Text Content */}
                <div>
                  <Label htmlFor="text-content">
                    Текстова версія (опціонально)
                  </Label>
                  <Textarea
                    id="text-content"
                    value={formData.textContent}
                    onChange={(e) =>
                      setFormData({ ...formData, textContent: e.target.value })
                    }
                    rows={8}
                    className="mt-1"
                    placeholder="Введіть текстову версію для клієнтів без підтримки HTML..."
                  />
                  <p className="text-xs text-muted-500 mt-1">
                    Текстова версія відправляється як альтернатива для email
                    клієнтів без HTML
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked as boolean })
                    }
                  />
                  <Label htmlFor="is-active" className="cursor-pointer">
                    Шаблон активний (використовується системою)
                  </Label>
                </div>

                {/* Change Reason */}
                <div>
                  <Label htmlFor="change-reason">
                    Причина зміни (опціонально)
                  </Label>
                  <Input
                    id="change-reason"
                    value={formData.changeReason}
                    onChange={(e) =>
                      setFormData({ ...formData, changeReason: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Напр: Оновлено посилання на сайт"
                  />
                  <p className="text-xs text-muted-500 mt-1">
                    Буде збережено в історії змін
                  </p>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t-2 border-line">
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
              </div>
            </div>
          </form>
        </TabsContent>

        {/* Variables Tab */}
        <TabsContent value="variables" className="mt-0">
          <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <h2 className="font-syne text-xl font-bold mb-4">Доступні змінні</h2>
            <p className="text-muted-500 text-sm mb-6">
              Використовуйте ці змінні в темі та контенті листа у форматі{' '}
              <code className="bg-panel-850 text-canvas px-1">
                {'{{variableName}}'}
              </code>
            </p>

            <div className="space-y-4">
              {template.availableVariables.map((variable) => (
                <div
                  key={variable}
                  className="p-4 border border-line rounded-lg bg-panel-900"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-bronze flex-shrink-0 mt-0.5" />
                    <div>
                      <code className="bg-panel-850 text-canvas px-2 py-1 rounded text-sm">
                        {`{{${variable}}}`}
                      </code>
                      <p className="text-muted-500 text-sm mt-2">
                        {template.variableDescriptions[variable] ||
                          'Опис не вказано'}
                      </p>
                      {template.previewData[variable] && (
                        <p className="text-xs text-muted-500 mt-1">
                          <strong>Приклад:</strong> {template.previewData[variable]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-0">
          <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <h2 className="font-syne text-xl font-bold mb-4">Історія версій</h2>
            <p className="text-muted-500 text-sm mb-6">
              Всі зміни шаблону зберігаються для аудиту
            </p>

            <div className="space-y-4">
              {template.history && template.history.length > 0 ? (
                template.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 border border-line rounded-lg bg-panel-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <History className="w-4 h-4 text-bronze" />
                          <span className="font-bold">Версія {entry.version}</span>
                        </div>
                        <p className="text-sm text-muted-500">
                          <strong>Тема:</strong> {entry.subject}
                        </p>
                        {entry.changeReason && (
                          <p className="text-sm text-muted-500 mt-1">
                            <strong>Причина:</strong> {entry.changeReason}
                          </p>
                        )}
                        <p className="text-xs text-muted-500 mt-2">
                          Змінено {new Date(entry.changedAt).toLocaleDateString('uk-UA')}{' '}
                          {entry.changedBy &&
                            `• ${entry.changedBy.first_name} ${entry.changedBy.last_name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-500 text-center py-8">
                  Історія змін порожня
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
