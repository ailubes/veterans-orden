'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Search, Pencil, Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

type Job = {
  id: string;
  title: string;
  company_name?: string | null;
  location?: string | null;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'project' | 'internship';
  salary_min?: number | null;
  salary_max?: number | null;
  application_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  description: string;
  status: 'active' | 'closed';
  created_at: string;
  author: {
    id: string;
    display_name: string;
    email?: string | null;
  };
  post?: {
    id: string;
    visibility: 'public' | 'followers' | 'private';
  } | null;
};

const EMPLOYMENT_LABELS: Record<Job['employment_type'], string> = {
  full_time: 'Повна зайнятість',
  part_time: 'Часткова зайнятість',
  contract: 'Контракт',
  project: 'Проєктна',
  internship: 'Стажування',
};

const EMPTY_FORM = {
  title: '',
  company_name: '',
  location: '',
  employment_type: 'full_time' as Job['employment_type'],
  salary_min: '',
  salary_max: '',
  application_url: '',
  contact_email: '',
  contact_phone: '',
  description: '',
  status: 'active' as Job['status'],
  visibility: 'public' as 'public' | 'followers' | 'private',
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const statusOk = statusFilter === 'all' || job.status === statusFilter;
      if (!statusOk) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        (job.company_name || '').toLowerCase().includes(q) ||
        (job.author?.display_name || '').toLowerCase().includes(q)
      );
    });
  }, [jobs, search, statusFilter]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '200');

      const response = await fetch(`/api/admin/jobs?${params.toString()}`);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  function startEdit(job: Job) {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company_name: job.company_name || '',
      location: job.location || '',
      employment_type: job.employment_type,
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      application_url: job.application_url || '',
      contact_email: job.contact_email || '',
      contact_phone: job.contact_phone || '',
      description: job.description,
      status: job.status,
      visibility: job.post?.visibility || 'public',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!form.title.trim() || !form.description.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/jobs/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          company_name: form.company_name.trim() || null,
          location: form.location.trim() || null,
          salary_min: form.salary_min ? Number(form.salary_min) : null,
          salary_max: form.salary_max ? Number(form.salary_max) : null,
          application_url: form.application_url.trim() || null,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Не вдалося оновити вакансію');
      }

      await fetchJobs();
      cancelEdit();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не вдалося оновити вакансію');
    } finally {
      setSaving(false);
    }
  }

  async function deleteJob(id: string) {
    if (!confirm('Видалити вакансію та пов\'язаний пост у стрічці?')) return;

    try {
      const response = await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Не вдалося видалити вакансію');
      }

      setJobs((prev) => prev.filter((job) => job.id !== id));
      if (editingId === id) cancelEdit();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не вдалося видалити вакансію');
    }
  }

  const activeCount = jobs.filter((j) => j.status === 'active').length;
  const closedCount = jobs.filter((j) => j.status === 'closed').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад до панелі
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="label text-bronze mb-2">АДМІНІСТРУВАННЯ</p>
            <h1 className="font-syne text-3xl font-bold flex items-center gap-2">
              <Briefcase className="w-7 h-7" /> Робота
            </h1>
          </div>
          <Link href="/dashboard/jobs" className="btn btn-outline">Відкрити модуль</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">АКТИВНІ</p>
          <p className="font-syne text-3xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">ЗАКРИТІ</p>
          <p className="font-syne text-3xl font-bold text-gray-500">{closedCount}</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">У СТРІЧЦІ</p>
          <p className="font-syne text-3xl font-bold text-bronze">{jobs.filter((j) => !!j.post?.id).length}</p>
        </div>
      </div>

      <div className="bg-panel-900 border border-line rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchJobs();
              }
            }}
            placeholder="Пошук за назвою, компанією або автором"
            className="w-full bg-panel-850 border border-line rounded pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 text-xs font-bold rounded border transition-colors ${
                statusFilter === status
                  ? 'bg-bronze text-bg-950 border-bronze'
                  : 'border-line text-muted-500 hover:border-bronze/50'
              }`}
            >
              {status === 'all' ? 'Всі' : status === 'active' ? 'Активні' : 'Закриті'}
            </button>
          ))}
          <button onClick={fetchJobs} className="btn btn-outline text-xs">Оновити</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-panel-900 rounded-lg animate-pulse" />)}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-500 text-sm bg-panel-900 border border-line rounded-lg">Вакансій не знайдено</div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div key={job.id} className={`bg-panel-900 border rounded-lg p-4 ${job.status === 'active' ? 'border-line' : 'border-line/50 opacity-80'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm truncate">{job.title}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${job.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {job.status === 'active' ? 'Активна' : 'Закрита'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-panel-850/10 text-muted-500">
                      {EMPLOYMENT_LABELS[job.employment_type]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-500 truncate">
                    {job.company_name || 'Без компанії'} {job.location ? `• ${job.location}` : ''}
                  </p>
                  <p className="text-xs text-muted-500 truncate mt-0.5">
                    Автор: {job.author.display_name} {job.author.email ? `• ${job.author.email}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {job.post?.id ? (
                    <Link href={`/post/${job.post.id}`} className="p-2 hover:bg-panel-850/10 rounded" title="Відкрити пост обговорення">
                      <MessageSquare size={16} />
                    </Link>
                  ) : null}
                  <button onClick={() => startEdit(job)} className="p-2 hover:bg-panel-850/10 rounded" title="Редагувати">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteJob(job.id)} className="p-2 hover:bg-red-500/10 rounded text-red-400" title="Видалити">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {editingId === job.id && (
                <div className="mt-4 pt-4 border-t border-line/20 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Назва" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <input value={form.company_name} onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))} placeholder="Компанія" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Локація" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <select value={form.employment_type} onChange={(e) => setForm((prev) => ({ ...prev, employment_type: e.target.value as Job['employment_type'] }))} className="bg-panel-850 border border-line rounded px-3 py-2 text-sm">
                      {Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <input value={form.salary_min} type="number" onChange={(e) => setForm((prev) => ({ ...prev, salary_min: e.target.value }))} placeholder="ЗП від" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <input value={form.salary_max} type="number" onChange={(e) => setForm((prev) => ({ ...prev, salary_max: e.target.value }))} placeholder="ЗП до" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <input value={form.application_url} onChange={(e) => setForm((prev) => ({ ...prev, application_url: e.target.value }))} placeholder="URL відгуку" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <input value={form.contact_email} onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))} placeholder="Email" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <input value={form.contact_phone} onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))} placeholder="Телефон" className="bg-panel-850 border border-line rounded px-3 py-2 text-sm" />
                    <select value={form.visibility} onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value as 'public' | 'followers' | 'private' }))} className="bg-panel-850 border border-line rounded px-3 py-2 text-sm">
                      <option value="public">Видимість поста: Публічно</option>
                      <option value="followers">Видимість поста: Підписники</option>
                      <option value="private">Видимість поста: Приватно</option>
                    </select>
                    <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Job['status'] }))} className="bg-panel-850 border border-line rounded px-3 py-2 text-sm">
                      <option value="active">Статус: Активна</option>
                      <option value="closed">Статус: Закрита</option>
                    </select>
                  </div>

                  <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={4} placeholder="Опис" className="w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm resize-none" />

                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving || !form.title.trim() || !form.description.trim()} className="btn">
                      {saving ? 'Збереження...' : 'Зберегти'}
                    </button>
                    <button onClick={cancelEdit} className="btn btn-outline">Скасувати</button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-500">{new Date(job.created_at).toLocaleString('uk-UA')}</span>
                {job.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 text-green-400"><CheckCircle size={14} />Опубліковано</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-500"><XCircle size={14} />Закрито</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
