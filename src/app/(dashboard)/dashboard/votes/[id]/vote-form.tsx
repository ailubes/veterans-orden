'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

interface VoteOption {
  id: string;
  text: string;
  description?: string;
}

interface VoteFormProps {
  voteId: string;
  options: VoteOption[];
}

export function VoteForm({ voteId, options }: VoteFormProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedOption) {
      setError('Оберіть варіант');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/votes/${voteId}/cast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Помилка голосування');
        return;
      }

      // Refresh the page to show results
      router.refresh();
    } catch {
      setError('Помилка з\'єднання');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-syne text-xl font-bold text-text-100">Оберіть варіант</h2>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={`block p-4 border rounded-lg cursor-pointer transition-all ${
              selectedOption === option.id
                ? 'border-bronze bg-bronze/5'
                : 'border-line hover:border-bronze/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-6 h-6 flex-shrink-0 border-2 rounded flex items-center justify-center ${
                  selectedOption === option.id
                    ? 'border-bronze bg-bronze text-bg-950'
                    : 'border-muted-500'
                }`}
              >
                {selectedOption === option.id && <Check size={14} />}
              </div>
              <div className="flex-1">
                <input
                  type="radio"
                  name="vote-option"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  className="sr-only"
                />
                <span className="font-bold text-text-100">{option.text}</span>
                {option.description && (
                  <p className="text-sm text-muted-500 mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-line">
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedOption}
          className="w-full bg-bronze text-bg-950 px-6 py-3 font-bold text-sm hover:bg-bronze/90 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'ОБРОБКА...' : 'ПРОГОЛОСУВАТИ →'}
        </button>
        <p className="text-xs text-muted-500 mt-3 text-center">
          Голос є анонімним і не може бути змінений після відправки
        </p>
      </div>
    </div>
  );
}
