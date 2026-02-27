'use client';

import { useState, useEffect, useRef } from 'react';
import { AdminProfile } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2, Download, FileIcon, Pencil, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrgDocument {
  id: string;
  name: string;
  url: string;
  storage_path: string;
  category: string;
  sort_order: number;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface DocumentManagerProps {
  category: 'documents' | 'media' | 'press_kit';
  title: string;
  description: string;
  accept: string;
  adminProfile: AdminProfile;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1048576).toFixed(1)} МБ`;
}

function MimeTypeBadge({ mimeType }: { mimeType: string | null }) {
  if (!mimeType) return null;
  const short = mimeType.split('/')[1]?.toUpperCase().replace('VND.OPENXMLFORMATS-OFFICEDOCUMENT.', '').split('.').pop() ?? mimeType;
  return (
    <span className="inline-block text-xs font-mono px-1.5 py-0.5 rounded bg-panel-850 border border-line text-muted-500">
      {short}
    </span>
  );
}

export default function DocumentManager({
  category,
  title,
  description,
  accept,
  adminProfile: _adminProfile,
}: DocumentManagerProps) {
  const [docs, setDocs] = useState<OrgDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function fetchDocs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/settings/documents?category=${category}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setDocs(await res.json());
    } catch {
      toast({ title: 'Помилка', description: 'Не вдалося завантажити список файлів', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: 'Оберіть файл', variant: 'destructive' });
      return;
    }
    if (!displayName.trim()) {
      toast({ title: 'Введіть назву файлу', variant: 'destructive' });
      return;
    }
    if (file.size > 10485760) {
      toast({ title: 'Файл занадто великий', description: 'Максимальний розмір — 10 МБ', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', displayName.trim());
      fd.append('category', category);

      const res = await fetch('/api/admin/settings/documents', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setDocs(prev => [...prev, data]);
      setDisplayName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({ title: 'Файл завантажено' });
    } catch (err: unknown) {
      toast({ title: 'Помилка завантаження', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Видалити файл? Цю дію неможливо скасувати.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/settings/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setDocs(prev => prev.filter(d => d.id !== id));
      toast({ title: 'Файл видалено' });
    } catch (err: unknown) {
      toast({ title: 'Помилка видалення', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) return;
    try {
      const res = await fetch(`/api/admin/settings/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setDocs(prev => prev.map(d => d.id === id ? data : d));
      setEditingId(null);
      toast({ title: 'Назву оновлено' });
    } catch (err: unknown) {
      toast({ title: 'Помилка оновлення', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    }
  }

  return (
    <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <h2 className="font-syne text-xl sm:text-2xl font-bold mb-1">{title}</h2>
      <p className="text-muted-500 mb-6">{description}</p>

      {/* Upload form */}
      <div className="border border-line rounded-lg p-4 bg-panel-850 mb-6">
        <h3 className="font-bold mb-3">Завантажити файл</h3>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor={`name-${category}`} className="mb-1 block">Назва</Label>
            <Input
              id={`name-${category}`}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Введіть назву файлу..."
              disabled={uploading}
            />
          </div>
          <div>
            <Label htmlFor={`file-${category}`} className="mb-1 block">Файл (макс. 10 МБ)</Label>
            <input
              id={`file-${category}`}
              ref={fileInputRef}
              type="file"
              accept={accept}
              disabled={uploading}
              className="block w-full text-sm text-text-100 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-line file:bg-panel-900 file:text-sm file:font-medium file:text-text-100 hover:file:bg-panel-850 cursor-pointer disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn-primary self-start flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Завантаження...' : 'Завантажити'}
          </button>
        </div>
      </div>

      {/* File list */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Завантаження...
        </div>
      ) : docs.length === 0 ? (
        <p className="text-muted-500 text-sm">Файлів ще немає. Завантажте перший файл вище.</p>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-line bg-panel-850">
              <FileIcon className="w-4 h-4 text-muted-500 shrink-0" />

              <div className="flex-1 min-w-0">
                {editingId === doc.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(doc.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleRename(doc.id)} className="text-green-500 hover:text-green-400">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-500 hover:text-text-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{doc.name}</span>
                    <MimeTypeBadge mimeType={doc.mime_type} />
                    {doc.size_bytes && (
                      <span className="text-xs text-muted-500">{formatBytes(doc.size_bytes)}</span>
                    )}
                  </div>
                )}
              </div>

              {editingId !== doc.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditingId(doc.id); setEditingName(doc.name); }}
                    className="p-1.5 rounded hover:bg-panel-900 text-muted-500 hover:text-text-100 transition-colors"
                    title="Перейменувати"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={doc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-panel-900 text-muted-500 hover:text-bronze transition-colors"
                    title="Завантажити"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-1.5 rounded hover:bg-panel-900 text-muted-500 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Видалити"
                  >
                    {deletingId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
