'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DeleteVoteButtonProps {
  voteId: string;
  voteTitle: string;
  variant?: 'icon' | 'row';
}

export function DeleteVoteButton({ voteId, voteTitle, variant = 'icon' }: DeleteVoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Видалити голосування "${voteTitle}"? Цю дію не можна скасувати.`)) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // Delete vote_options first (FK constraint)
      await supabase.from('vote_options').delete().eq('vote_id', voteId);
      // Delete user_votes
      await supabase.from('user_votes').delete().eq('vote_id', voteId);
      // Delete the vote itself
      const { error } = await supabase.from('votes').delete().eq('id', voteId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error('Error deleting vote:', err);
      alert('Помилка при видаленні голосування');
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
