'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from 'lucide-react';

interface FeedbackWidgetProps {
  articleId: string;
}

export function FeedbackWidget({ articleId }: FeedbackWidgetProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedback(isHelpful ? 'helpful' : 'not_helpful');

    if (!isHelpful) {
      // If not helpful, show comment box
      setShowComment(true);
    } else {
      // If helpful, submit immediately
      await submitFeedback(isHelpful, '');
    }
  };

  const submitFeedback = async (isHelpful: boolean, commentText: string) => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/help/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          isHelpful,
          comment: commentText || undefined,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowComment(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(false, comment);
  };

  if (submitted) {
    return (
      <div className="bg-white border-2 border-timber-dark p-6 text-center relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <CheckCircle className="mx-auto mb-3 text-accent" size={48} />
        <h3 className="font-syne text-xl font-bold mb-2">Дякуємо за відгук!</h3>
        <p className="text-timber-beam">
          Ваша думка допоможе нам покращити документацію.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-timber-dark p-6 relative">
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

      <h3 className="font-syne text-lg font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="text-accent" size={20} />
        Чи була ця стаття корисною?
      </h3>

      {!feedback ? (
        <div className="flex gap-3">
          <button
            onClick={() => handleFeedback(true)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all disabled:opacity-50"
          >
            <ThumbsUp size={20} />
            Так, корисно
          </button>
          <button
            onClick={() => handleFeedback(false)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-timber-dark font-bold hover:bg-timber-dark/10 transition-colors disabled:opacity-50"
          >
            <ThumbsDown size={20} />
            Ні, не корисно
          </button>
        </div>
      ) : showComment && (
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Що можна покращити? (необов'язково)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none font-mono resize-none"
              placeholder="Напишіть ваші коментарі..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-accent text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all disabled:opacity-50"
            >
              {submitting ? 'Надсилання...' : 'Надіслати відгук'}
            </button>
            <button
              type="button"
              onClick={() => submitFeedback(false, '')}
              disabled={submitting}
              className="px-6 py-2 border-2 border-timber-dark font-bold hover:bg-timber-dark/10 transition-colors"
            >
              Пропустити
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
