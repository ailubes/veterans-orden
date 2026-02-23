'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteAdminButtonProps {
  apiPath: string;
  itemTitle: string;
}

export function DeleteAdminButton({ apiPath, itemTitle }: DeleteAdminButtonProps) {
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

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-sm btn-outline flex items-center gap-1"
      title="Видалити"
    >
      <Trash2 size={14} />
    </button>
  );
}
