'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteAdminButtonProps {
  apiPath: string;
  itemTitle: string;
  variant?: 'icon' | 'row';
}

export function DeleteAdminButton({ apiPath, itemTitle, variant = 'icon' }: DeleteAdminButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Видалити "${itemTitle}"? Цю дію не можна скасувати.`)) return;

    setLoading(true);
    try {
      const res = await fetch(apiPath, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Помилка при видаленні');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'row') {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 border-2 border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
        title="Видалити"
      >
        <Trash2 size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 hover:bg-red-50 rounded text-red-500 disabled:opacity-50"
      title="Видалити"
    >
      <Trash2 size={16} />
    </button>
  );
}
