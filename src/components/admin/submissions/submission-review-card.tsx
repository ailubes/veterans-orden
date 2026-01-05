'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X, ExternalLink, Image as ImageIcon, Link as LinkIcon, Star, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubmissionReviewCardProps {
  submission: {
    id: string;
    proof_type: string;
    proof_url: string | null;
    proof_image_url: string | null;
    created_at: string;
    task?: {
      id: string;
      title: string;
      points: number;
      type: string;
      priority: string;
      description: string;
    };
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      avatar_url: string | null;
    };
  };
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-gray-400 text-white',
};

const priorityLabels: Record<string, string> = {
  urgent: 'Терміново',
  high: 'Високий',
  medium: 'Середній',
  low: 'Низький',
};

export function SubmissionReviewCard({ submission }: SubmissionReviewCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Помилка підтвердження');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Помилка підтвердження');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', feedback }),
      });

      if (response.ok) {
        setShowRejectModal(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Помилка відхилення');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Помилка відхилення');
    } finally {
      setLoading(false);
    }
  };

  const submittedDate = new Date(submission.created_at).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div className="bg-panel-900 border border-line rounded-lg p-4 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Task & User Info */}
          <div className="flex-1">
            {/* Task info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold ${
                      priorityColors[submission.task?.priority || 'medium']
                    }`}
                  >
                    {priorityLabels[submission.task?.priority || 'medium']}
                  </span>
                  <span className="flex items-center gap-1 text-bronze font-bold text-sm">
                    <Star size={14} />
                    +{submission.task?.points || 0}
                  </span>
                </div>
                <Link
                  href={`/admin/tasks/${submission.task?.id}`}
                  className="font-syne text-lg font-bold hover:text-bronze transition-colors"
                >
                  {submission.task?.title}
                </Link>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 p-3 bg-panel-850/5 rounded">
              <div className="w-10 h-10 rounded-full bg-panel-850/10 flex items-center justify-center overflow-hidden">
                {submission.user?.avatar_url ? (
                  <Image
                    src={submission.user.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <User size={20} className="text-muted-500" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {submission.user?.first_name} {submission.user?.last_name}
                </p>
                <p className="text-xs text-muted-500">{submission.user?.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-500">Надіслано</p>
                <p className="text-xs font-bold">{submittedDate}</p>
              </div>
            </div>
          </div>

          {/* Center: Proof */}
          <div className="lg:w-64 flex-shrink-0">
            <p className="label mb-2">
              {submission.proof_type === 'image' ? (
                <span className="flex items-center gap-1">
                  <ImageIcon size={12} />
                  СКРІНШОТ
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <LinkIcon size={12} />
                  ПОСИЛАННЯ
                </span>
              )}
            </p>

            {submission.proof_type === 'image' && submission.proof_image_url ? (
              <button
                onClick={() => setShowImageModal(true)}
                className="w-full h-32 border border-line rounded-lg/20 rounded overflow-hidden hover:border-bronze transition-colors"
              >
                <img
                  src={submission.proof_image_url}
                  alt="Proof"
                  className="w-full h-full object-cover"
                />
              </button>
            ) : submission.proof_url ? (
              <a
                href={submission.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-line rounded-lg/20 rounded hover:border-bronze transition-colors text-sm text-bronze truncate"
              >
                <ExternalLink size={16} className="flex-shrink-0" />
                <span className="truncate">{submission.proof_url}</span>
              </a>
            ) : (
              <p className="text-sm text-muted-500">Немає підтвердження</p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="lg:w-40 flex-shrink-0 flex flex-row lg:flex-col gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 btn flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={18} />
                  <span className="hidden lg:inline">ПІДТВЕРДИТИ</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex-1 btn btn-outline flex items-center justify-center gap-2 border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              <X size={18} />
              <span className="hidden lg:inline">ВІДХИЛИТИ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="bg-panel-900 border border-line rounded-lg max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-syne">Скріншот підтвердження</DialogTitle>
          </DialogHeader>
          {submission.proof_image_url && (
            <img
              src={submission.proof_image_url}
              alt="Proof"
              className="w-full max-h-[70vh] object-contain"
            />
          )}
          <div className="flex justify-end gap-2 mt-4">
            <a
              href={submission.proof_image_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-sm flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Відкрити оригінал
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="bg-panel-900 border border-line rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne">Відхилення підтвердження</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-500">
              Ви впевнені, що хочете відхилити це підтвердження? Член отримає сповіщення.
            </p>
            <div>
              <label className="block text-sm font-bold mb-2">
                Коментар (необов&apos;язково)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Опишіть причину відхилення..."
                className="w-full px-4 py-3 border border-line rounded-lg bg-panel-900 text-sm focus:border-bronze focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 btn btn-outline"
                disabled={loading}
              >
                СКАСУВАТИ
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 btn bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <X size={18} />
                    ВІДХИЛИТИ
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
