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
      <h2 className="font-syne text-xl font-bold">Оберіть варіант</h2>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={`block p-4 border-2 cursor-pointer transition-all ${
              selectedOption === option.id
                ? 'border-accent bg-accent/5'
                : 'border-timber-dark/30 hover:border-timber-dark'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-6 h-6 flex-shrink-0 border-2 flex items-center justify-center ${
                  selectedOption === option.id
                    ? 'border-accent bg-accent text-white'
                    : 'border-timber-dark/50'
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
                <span className="font-bold">{option.text}</span>
                {option.description && (
                  <p className="text-sm text-timber-beam mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-timber-dark/20">
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedOption}
          className="btn w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'ОБРОБКА...' : 'ПРОГОЛОСУВАТИ →'}
        </button>
        <p className="text-xs text-timber-beam mt-3 text-center">
          Голос є анонімним і не може бути змінений після відправки
        </p>
      </div>
    </div>
  );
}
