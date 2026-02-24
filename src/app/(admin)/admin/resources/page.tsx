'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Resource {
  id: string;
  category: string;
  title: string;
  description: string | null;
  contact: string | null;
  address: string | null;
  region: string | null;
  is_free: boolean;
  is_active: boolean;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  jobs: 'Зайнятість',
  legal: 'Правова допомога',
  support: 'Психологічна підтримка',
  healthcare: 'Охорона здоров\'я',
};

const EMPTY_FORM = {
  category: 'jobs',
  title: '',
  description: '',
  contact: '',
  address: '',
  region: 'national',
  is_free: true,
  is_active: true,
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    fetchResources();
  }, [filterCategory]);

  async function fetchResources() {
    setLoading(true);
    const url = filterCategory ? `/api/resources?category=${filterCategory}` : '/api/resources';
    const res = await fetch(url);
    const data = await res.json();
    // Admin sees all including inactive — fetch via service role API if needed
    setResources(data.resources || []);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/resources/${editingId}` : '/api/admin/resources';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        fetchResources();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Видалити цей ресурс?')) return;
    await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
    fetchResources();
  }

  async function handleToggleActive(resource: Resource) {
    await fetch(`/api/admin/resources/${resource.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...resource, is_active: !resource.is_active }),
    });
    fetchResources();
  }

  function handleEdit(resource: Resource) {
    setForm({
      category: resource.category,
      title: resource.title,
      description: resource.description || '',
      contact: resource.contact || '',
      address: resource.address || '',
      region: resource.region || 'national',
      is_free: resource.is_free,
      is_active: resource.is_active,
    });
    setEditingId(resource.id);
    setShowForm(true);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад до панелі
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="label text-bronze mb-2">АДМІН</p>
            <h1 className="font-syne text-3xl font-bold">Ресурси для ветеранів</h1>
          </div>
          <button
            onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-bronze text-bg-950 px-4 py-2 rounded font-bold text-sm hover:bg-bronze/90 transition-colors"
          >
            <Plus size={16} /> Додати ресурс
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'jobs', 'legal', 'support', 'healthcare'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${
              filterCategory === cat
                ? 'bg-bronze text-bg-950 border-bronze'
                : 'border-line text-muted-500 hover:border-bronze/50'
            }`}
          >
            {cat ? CATEGORY_LABELS[cat] : 'Всі'}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-panel-900 border border-line rounded-lg p-6 mb-6">
          <h2 className="font-syne font-bold text-lg mb-4">{editingId ? 'Редагувати' : 'Новий'} ресурс</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-muted-500 block mb-1">КАТЕГОРІЯ</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm text-text-100"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-500 block mb-1">НАЗВА *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm text-text-100"
                placeholder="Назва організації або програми"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-muted-500 block mb-1">ОПИС</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm text-text-100 resize-none"
                placeholder="Короткий опис послуг"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-500 block mb-1">КОНТАКТ (телефон / сайт / email)</label>
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm text-text-100"
                placeholder="+38 0xx xxx xx xx або https://..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-500 block mb-1">РЕГІОН</label>
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm text-text-100"
                placeholder="national, Київ, Харків..."
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_free}
                  onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
                  className="accent-bronze"
                />
                <span className="text-sm">Безоплатно</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="accent-bronze"
                />
                <span className="text-sm">Активний</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.title}
              className="bg-bronze text-bg-950 px-5 py-2 rounded font-bold text-sm hover:bg-bronze/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
              className="border border-line px-5 py-2 rounded text-sm hover:bg-panel-850 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Resource List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-panel-900 rounded-lg animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-muted-500 text-sm">Ресурсів не знайдено</div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <div key={r.id} className={`bg-panel-900 border rounded-lg p-4 flex items-start gap-4 ${r.is_active ? 'border-line' : 'border-line/50 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-bronze">{CATEGORY_LABELS[r.category]}</span>
                  {r.region && r.region !== 'national' && (
                    <span className="text-xs text-muted-500">· {r.region}</span>
                  )}
                  {r.is_free ? (
                    <span className="text-xs text-green-400">· Безоплатно</span>
                  ) : (
                    <span className="text-xs text-bronze">· Платно</span>
                  )}
                </div>
                <p className="font-bold text-sm text-text-100 truncate">{r.title}</p>
                {r.contact && <p className="text-xs text-muted-500 truncate mt-0.5">{r.contact}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(r)}
                  className="p-1.5 hover:bg-panel-850 rounded transition-colors"
                  title={r.is_active ? 'Деактивувати' : 'Активувати'}
                >
                  {r.is_active ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-muted-500" />}
                </button>
                <button
                  onClick={() => handleEdit(r)}
                  className="p-1.5 hover:bg-panel-850 rounded transition-colors"
                  title="Редагувати"
                >
                  <Pencil size={16} className="text-muted-500" />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                  title="Видалити"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
