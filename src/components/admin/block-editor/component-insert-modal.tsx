'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ComponentInsertModalProps {
  componentType: string;
  onInsert: (mdxCode: string) => void;
  onClose: () => void;
}

interface ComponentConfig {
  title: string;
  fields: FieldConfig[];
  generateMdx: (values: Record<string, string>) => string;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'url';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

const componentConfigs: Record<string, ComponentConfig> = {
  callout: {
    title: 'Сповіщення',
    fields: [
      {
        name: 'type',
        label: 'Тип',
        type: 'select',
        options: [
          { value: 'info', label: 'Інформація' },
          { value: 'warning', label: 'Попередження' },
          { value: 'error', label: 'Помилка' },
          { value: 'success', label: 'Успіх' },
        ],
        required: true,
      },
      { name: 'title', label: 'Заголовок', type: 'text', placeholder: 'Заголовок (опціонально)' },
      { name: 'content', label: 'Текст', type: 'textarea', placeholder: 'Текст сповіщення', required: true },
    ],
    generateMdx: (values) => {
      const titleProp = values.title ? ` title="${values.title}"` : '';
      return `<Callout type="${values.type}"${titleProp}>
${values.content}
</Callout>`;
    },
  },
  card: {
    title: 'Картка',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', placeholder: 'Заголовок картки', required: true },
      { name: 'content', label: 'Опис', type: 'textarea', placeholder: 'Опис' },
      { name: 'href', label: 'Посилання', type: 'url', placeholder: 'https://...' },
      { name: 'icon', label: 'Іконка', type: 'text', placeholder: 'Назва іконки (Shield, Users, etc.)' },
    ],
    generateMdx: (values) => {
      let props = `title="${values.title}"`;
      if (values.href) props += ` href="${values.href}"`;
      if (values.icon) props += ` icon="${values.icon}"`;
      return `<Card ${props}>
${values.content || ''}
</Card>`;
    },
  },
  cardGrid: {
    title: 'Сітка карток',
    fields: [
      {
        name: 'cols',
        label: 'Колонок',
        type: 'select',
        options: [
          { value: '2', label: '2 колонки' },
          { value: '3', label: '3 колонки' },
          { value: '4', label: '4 колонки' },
        ],
        required: true,
      },
    ],
    generateMdx: (values) => {
      return `<CardGrid cols={${values.cols}}>
<Card title="Картка 1">
Опис першої картки
</Card>
<Card title="Картка 2">
Опис другої картки
</Card>
</CardGrid>`;
    },
  },
  accordion: {
    title: 'Акордеон',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', placeholder: 'Заголовок', required: true },
      { name: 'content', label: 'Контент', type: 'textarea', placeholder: 'Контент акордеону', required: true },
      {
        name: 'defaultOpen',
        label: 'Відкритий за замовчуванням',
        type: 'select',
        options: [
          { value: 'false', label: 'Ні' },
          { value: 'true', label: 'Так' },
        ],
      },
    ],
    generateMdx: (values) => {
      const openProp = values.defaultOpen === 'true' ? ' defaultOpen' : '';
      return `<Accordion title="${values.title}"${openProp}>
${values.content}
</Accordion>`;
    },
  },
  tabs: {
    title: 'Вкладки',
    fields: [
      { name: 'tab1Label', label: 'Вкладка 1 - назва', type: 'text', placeholder: 'Вкладка 1', required: true },
      { name: 'tab1Content', label: 'Вкладка 1 - контент', type: 'textarea', placeholder: 'Контент', required: true },
      { name: 'tab2Label', label: 'Вкладка 2 - назва', type: 'text', placeholder: 'Вкладка 2', required: true },
      { name: 'tab2Content', label: 'Вкладка 2 - контент', type: 'textarea', placeholder: 'Контент', required: true },
    ],
    generateMdx: (values) => {
      return `<Tabs>
<Tab label="${values.tab1Label}">
${values.tab1Content}
</Tab>
<Tab label="${values.tab2Label}">
${values.tab2Content}
</Tab>
</Tabs>`;
    },
  },
  steps: {
    title: 'Кроки',
    fields: [
      { name: 'step1Title', label: 'Крок 1 - заголовок', type: 'text', placeholder: 'Крок 1', required: true },
      { name: 'step1Content', label: 'Крок 1 - опис', type: 'textarea', placeholder: 'Опис кроку' },
      { name: 'step2Title', label: 'Крок 2 - заголовок', type: 'text', placeholder: 'Крок 2' },
      { name: 'step2Content', label: 'Крок 2 - опис', type: 'textarea', placeholder: 'Опис кроку' },
      { name: 'step3Title', label: 'Крок 3 - заголовок', type: 'text', placeholder: 'Крок 3' },
      { name: 'step3Content', label: 'Крок 3 - опис', type: 'textarea', placeholder: 'Опис кроку' },
    ],
    generateMdx: (values) => {
      let steps = `<Step title="${values.step1Title}">\n${values.step1Content || ''}\n</Step>`;
      if (values.step2Title) {
        steps += `\n<Step title="${values.step2Title}">\n${values.step2Content || ''}\n</Step>`;
      }
      if (values.step3Title) {
        steps += `\n<Step title="${values.step3Title}">\n${values.step3Content || ''}\n</Step>`;
      }
      return `<Steps>\n${steps}\n</Steps>`;
    },
  },
  cta: {
    title: 'Заклик до дії',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', placeholder: 'Приєднуйтесь до нас', required: true },
      { name: 'description', label: 'Опис', type: 'textarea', placeholder: 'Короткий опис' },
      { name: 'buttonText', label: 'Текст кнопки', type: 'text', placeholder: 'Дізнатися більше', required: true },
      { name: 'href', label: 'Посилання', type: 'url', placeholder: '/join', required: true },
    ],
    generateMdx: (values) => {
      let props = `title="${values.title}" buttonText="${values.buttonText}" href="${values.href}"`;
      if (values.description) props += ` description="${values.description}"`;
      return `<CTA ${props} />`;
    },
  },
  video: {
    title: 'Відео',
    fields: [
      { name: 'src', label: 'URL відео', type: 'url', placeholder: 'https://youtube.com/watch?v=...', required: true },
      {
        name: 'provider',
        label: 'Платформа',
        type: 'select',
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'vimeo', label: 'Vimeo' },
        ],
      },
    ],
    generateMdx: (values) => {
      const providerProp = values.provider ? ` provider="${values.provider}"` : '';
      return `<Video src="${values.src}"${providerProp} />`;
    },
  },
};

export function ComponentInsertModal({ componentType, onInsert, onClose }: ComponentInsertModalProps) {
  const config = componentConfigs[componentType];
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!config) {
    return null;
  }

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    config.fields.forEach((field) => {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = 'Це поле обов\'язкове';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const mdxCode = config.generateMdx(values);
    onInsert(mdxCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-panel-900 border border-line rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <h3 className="font-syne text-lg font-bold text-text-100">
            {config.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-500 hover:text-text-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {config.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-bold text-muted-500 mb-1">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className={`w-full px-3 py-2 bg-panel-850 border text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded resize-none ${
                    errors[field.name] ? 'border-red-500' : 'border-line'
                  }`}
                />
              ) : field.type === 'select' ? (
                <select
                  value={values[field.name] || (field.options?.[0]?.value || '')}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`w-full px-3 py-2 bg-panel-850 border text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded ${
                    errors[field.name] ? 'border-red-500' : 'border-line'
                  }`}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'url' ? 'url' : 'text'}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-3 py-2 bg-panel-850 border text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded ${
                    errors[field.name] ? 'border-red-500' : 'border-line'
                  }`}
                />
              )}

              {errors[field.name] && (
                <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Preview */}
          <div className="bg-panel-850 border border-line rounded p-3">
            <p className="text-xs font-bold text-muted-500 mb-2">ПОПЕРЕДНІЙ ПЕРЕГЛЯД MDX:</p>
            <pre className="text-xs text-text-100 font-mono whitespace-pre-wrap overflow-x-auto">
              {config.generateMdx(values)}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-line text-text-100 text-sm font-bold hover:bg-panel-850 transition-colors rounded"
            >
              СКАСУВАТИ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors rounded"
            >
              ВСТАВИТИ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
