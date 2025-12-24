'use client';

import { useState } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

interface RSVPButtonProps {
  eventId: string;
  currentStatus: 'going' | 'maybe' | 'not_going' | null;
  onRSVPChange?: (status: 'going' | 'maybe' | 'not_going' | null) => void;
}

export function RSVPButton({ eventId, currentStatus, onRSVPChange }: RSVPButtonProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleRSVP = async (newStatus: 'going' | 'maybe' | 'not_going') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        onRSVPChange?.(newStatus);
      }
    } catch (error) {
      console.error('RSVP error:', error);
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStatus(null);
        onRSVPChange?.(null);
      }
    } catch (error) {
      console.error('Cancel RSVP error:', error);
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  };

  if (status) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors ${
            status === 'going'
              ? 'bg-green-500 text-white'
              : status === 'maybe'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-400 text-white'
          }`}
        >
          {status === 'going' && <Check size={16} />}
          {status === 'maybe' && <HelpCircle size={16} />}
          {status === 'not_going' && <X size={16} />}
          {status === 'going' && 'ЙДУ'}
          {status === 'maybe' && 'МОЖЛИВО'}
          {status === 'not_going' && 'НЕ ЙДУ'}
        </button>

        {showOptions && (
          <div className="absolute right-0 top-full mt-2 bg-canvas border-2 border-timber-dark shadow-lg z-10 min-w-[160px]">
            {status !== 'going' && (
              <button
                onClick={() => handleRSVP('going')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2"
              >
                <Check size={14} className="text-green-500" />
                Йду
              </button>
            )}
            {status !== 'maybe' && (
              <button
                onClick={() => handleRSVP('maybe')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 flex items-center gap-2"
              >
                <HelpCircle size={14} className="text-yellow-500" />
                Можливо
              </button>
            )}
            {status !== 'not_going' && (
              <button
                onClick={() => handleRSVP('not_going')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <X size={14} className="text-gray-500" />
                Не йду
              </button>
            )}
            <div className="border-t border-timber-dark/20" />
            <button
              onClick={handleCancel}
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
            >
              Скасувати відповідь
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={loading}
        className="btn text-sm disabled:opacity-50"
      >
        {loading ? 'ЗАВАНТАЖЕННЯ...' : 'ДОЛУЧИТИСЯ →'}
      </button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-2 bg-canvas border-2 border-timber-dark shadow-lg z-10 min-w-[160px]">
          <button
            onClick={() => handleRSVP('going')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2"
          >
            <Check size={14} className="text-green-500" />
            Йду
          </button>
          <button
            onClick={() => handleRSVP('maybe')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 flex items-center gap-2"
          >
            <HelpCircle size={14} className="text-yellow-500" />
            Можливо
          </button>
          <button
            onClick={() => handleRSVP('not_going')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <X size={14} className="text-gray-500" />
            Не йду
          </button>
        </div>
      )}
    </div>
  );
}
