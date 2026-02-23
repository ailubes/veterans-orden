'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteVoteButtonProps {
  voteId: string;
  voteTitle: string;
}

export function DeleteVoteButton({ voteId, voteTitle }: DeleteVoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Видалити голосування "${voteTitle}"? Цю дію не можна скасувати.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/votes/${voteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      console.error('Error deleting vote:', err);
      alert('Помилка при видаленні голосування');
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
