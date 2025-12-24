'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClaimButtonProps {
  taskId: string;
}

export function ClaimButton({ taskId }: ClaimButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/claim`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Claim error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="btn btn-outline text-sm flex-shrink-0 disabled:opacity-50"
    >
      {loading ? 'ОБРОБКА...' : 'ВЗЯТИ →'}
    </button>
  );
}

interface CompleteButtonProps {
  taskId: string;
  requiresProof?: boolean;
  points: number;
}

export function CompleteButton({ taskId, requiresProof, points }: CompleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showProofInput, setShowProofInput] = useState(false);
  const [proofUrl, setProofUrl] = useState('');

  const handleComplete = async () => {
    if (requiresProof && !proofUrl) {
      setShowProofInput(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl: proofUrl || undefined }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Complete error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showProofInput) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="Посилання на підтвердження"
          className="px-3 py-2 border-2 border-timber-dark text-sm font-mono"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowProofInput(false)}
            className="btn btn-outline text-sm flex-1"
          >
            СКАСУВАТИ
          </button>
          <button
            onClick={handleComplete}
            disabled={loading || !proofUrl}
            className="btn text-sm flex-1 disabled:opacity-50"
          >
            {loading ? '...' : 'НАДІСЛАТИ'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="btn text-sm disabled:opacity-50"
    >
      {loading ? 'ОБРОБКА...' : `ЗАВЕРШИТИ (+${points})`}
    </button>
  );
}
