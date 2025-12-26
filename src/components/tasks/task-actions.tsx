'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Link as LinkIcon, Image, Check, Clipboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  compressImage,
  getImageFromClipboard,
  formatFileSize,
} from '@/lib/utils/image-compression';

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
  const [compressing, setCompressing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [proofType, setProofType] = useState<'url' | 'image'>('image');
  const [proofUrl, setProofUrl] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle image processing (compression)
  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Будь ласка, виберіть зображення');
      return;
    }

    // Max 10MB before compression
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл занадто великий (максимум 10MB)');
      return;
    }

    setCompressing(true);
    setError('');
    setOriginalSize(file.size);

    try {
      // Compress to under 100KB
      const compressedFile = await compressImage(file, {
        maxSizeKB: 100,
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'image/jpeg',
      });

      setProofImage(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error('Compression error:', err);
      setError('Помилка стиснення зображення');
    } finally {
      setCompressing(false);
    }
  }, []);

  // Handle file input change
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  // Handle clipboard paste
  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (!showModal || proofType !== 'image') return;

    const file = getImageFromClipboard(event);
    if (file) {
      event.preventDefault();
      processImage(file);
    }
  }, [showModal, proofType, processImage]);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  }, [processImage]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // Add paste listener when modal is open
  useEffect(() => {
    if (showModal && proofType === 'image') {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [showModal, proofType, handlePaste]);

  const handleComplete = async () => {
    if (requiresProof) {
      setShowModal(true);
      return;
    }

    // Complete without proof
    await submitCompletion();
  };

  const submitCompletion = async () => {
    setLoading(true);
    setError('');

    try {
      let imageUrl = null;

      // Upload image if selected
      if (proofType === 'image' && proofImage) {
        const formData = new FormData();
        formData.append('file', proofImage);
        formData.append('context', 'task_proof');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Помилка завантаження зображення');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofType: requiresProof ? proofType : undefined,
          proofUrl: proofType === 'url' ? proofUrl : undefined,
          proofImageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка');
      }

      setShowModal(false);
      router.refresh();
    } catch (err) {
      console.error('Complete error:', err);
      setError(err instanceof Error ? err.message : 'Помилка надсилання');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate proof
    if (proofType === 'url' && !proofUrl) {
      setError('Будь ласка, введіть посилання');
      return;
    }
    if (proofType === 'image' && !proofImage) {
      setError('Будь ласка, виберіть зображення');
      return;
    }

    await submitCompletion();
  };

  const resetModal = () => {
    setProofType('image');
    setProofUrl('');
    setProofImage(null);
    setOriginalSize(0);
    setPreviewUrl(null);
    setError('');
  };

  const clearImage = () => {
    setProofImage(null);
    setPreviewUrl(null);
    setOriginalSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleComplete}
        disabled={loading}
        className="btn text-sm disabled:opacity-50 flex-shrink-0"
      >
        {loading ? 'ОБРОБКА...' : `ЗАВЕРШИТИ (+${points})`}
      </button>

      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) resetModal();
      }}>
        <DialogContent className="bg-canvas border-2 border-timber-dark max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne text-lg">
              Підтвердження виконання
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-timber-beam">
              Завантажте скріншот або надайте посилання як підтвердження виконання завдання.
            </p>

            {/* Proof Type Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProofType('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 transition-colors ${
                  proofType === 'image'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-timber-dark/20 hover:border-timber-dark/40'
                }`}
              >
                <Image size={18} />
                <span className="text-sm font-bold">Скріншот</span>
              </button>
              <button
                type="button"
                onClick={() => setProofType('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 transition-colors ${
                  proofType === 'url'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-timber-dark/20 hover:border-timber-dark/40'
                }`}
              >
                <LinkIcon size={18} />
                <span className="text-sm font-bold">Посилання</span>
              </button>
            </div>

            {/* Image Upload */}
            {proofType === 'image' && (
              <div>
                <label className="block text-sm font-bold mb-2">
                  Скріншот підтвердження
                </label>

                {compressing ? (
                  <div className="w-full py-8 border-2 border-dashed border-accent/40 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-timber-beam">Стиснення зображення...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-48 object-contain border-2 border-timber-dark"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                    {/* Show compression info */}
                    {originalSize > 0 && proofImage && (
                      <div className="mt-2 text-xs text-timber-beam flex items-center justify-between">
                        <span>
                          Оригінал: {formatFileSize(originalSize)}
                        </span>
                        <span className="text-green-600 font-bold">
                          Стиснуто: {formatFileSize(proofImage.size)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    ref={dropZoneRef}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="w-full py-8 border-2 border-dashed border-timber-dark/40 hover:border-accent transition-colors flex flex-col items-center gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <Upload size={28} className="text-timber-beam" />
                        <span className="text-xs text-timber-beam mt-1">Вибрати</span>
                      </div>
                      <div className="h-10 border-l border-timber-dark/20" />
                      <div className="flex flex-col items-center">
                        <Clipboard size={28} className="text-accent" />
                        <span className="text-xs text-accent mt-1 font-bold">Ctrl+V</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-timber-beam block">
                        Натисніть, перетягніть або вставте скріншот
                      </span>
                      <span className="text-xs text-timber-beam/60">
                        JPG, PNG до 10MB (буде стиснуто до ~100KB)
                      </span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* URL Input */}
            {proofType === 'url' && (
              <div>
                <label className="block text-sm font-bold mb-2">
                  Посилання на підтвердження
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border-2 border-timber-dark bg-canvas font-mono text-sm focus:border-accent focus:outline-none"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 border border-red-200">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 btn btn-outline"
                disabled={loading || compressing}
              >
                СКАСУВАТИ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || compressing || (proofType === 'url' && !proofUrl) || (proofType === 'image' && !proofImage)}
                className="flex-1 btn disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                    НАДСИЛАННЯ...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    НАДІСЛАТИ
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-timber-beam/60 text-center">
              Після перевірки адміністратором вам буде нараховано +{points} балів
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
