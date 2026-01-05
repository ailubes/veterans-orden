'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'ВИДАЛИТИ',
  cancelText = 'СКАСУВАТИ',
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-panel-850/60 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-panel-900 border-4 border-line max-w-md w-full shadow-2xl">
        {/* Joints */}
        <div className="joint joint-lg joint-tl" />
        <div className="joint joint-lg joint-tr" />
        <div className="joint joint-lg joint-bl" />
        <div className="joint joint-lg joint-br" />

        {/* Close button */}
        {!isDeleting && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-panel-850/10 transition-colors"
            aria-label="Закрити"
          >
            <X size={20} />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 border-2 border-red-500">
            <AlertTriangle size={32} className="text-red-600" />
          </div>

          {/* Title */}
          <h2 className="font-syne text-2xl font-bold text-center mb-3">
            {title}
          </h2>

          {/* Description */}
          <p className="text-center text-muted-500 mb-6">{description}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-bold border-2 border-red-700 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? 'ВИДАЛЕННЯ...' : confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-panel-900 text-text-100 font-bold border border-line rounded-lg hover:bg-panel-850 hover:text-canvas disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
