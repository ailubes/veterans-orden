'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { UploadContext, PresignedUrlResponse } from '@/types/upload';

interface ImageUploadZoneProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  label: string;
  maxSize?: number; // in bytes
  context?: UploadContext;
  compress?: boolean;
  className?: string;
}

export function ImageUploadZone({
  value,
  onChange,
  label,
  maxSize = 10485760, // 10MB default
  context = 'news_featured',
  compress = true,
  className = '',
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Непідтримуваний формат. Використовуйте JPG, PNG, WebP або GIF');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      setError(`Файл занадто великий. Максимум: ${maxSizeMB}MB`);
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10);

      // Always compress images to ~200KB for news, events
      let fileToUpload = file;
      if (compress) {
        setProgress(20);
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 0.2, // 200KB target
          maxWidthOrHeight: 1920, // Max dimension
          useWebWorker: true,
          fileType: 'image/jpeg', // Convert to JPEG for better compression
          initialQuality: 0.85,
        });
        console.log(
          `[Image Compression] ${(file.size / 1024).toFixed(0)}KB → ${(fileToUpload.size / 1024).toFixed(0)}KB`
        );
      }

      setProgress(40);

      // Request presigned URL from API
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: fileToUpload.type,
          fileSize: fileToUpload.size,
          context,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при отриманні URL для завантаження');
      }

      const data: PresignedUrlResponse = await response.json();
      setProgress(60);

      // Upload file directly to S3
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileToUpload.type,
        },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error('Помилка при завантаженні файлу');
      }

      setProgress(100);

      // Update parent component with public URL
      onChange(data.publicUrl);

      // Reset state
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      console.error('[Image Upload] Error:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-[--timber-dark]">{label}</label>

      {value && !isUploading ? (
        // Preview uploaded image
        <div className="relative">
          <div className="relative h-64 bg-gray-100 border-2 border-[--timber-dark] overflow-hidden">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            aria-label="Видалити зображення"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Upload zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isUploading ? handleClick : undefined}
          className={`
            relative h-64 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center
            transition-all cursor-pointer
            ${isDragging ? 'border-[--accent] bg-[--accent]/5' : 'border-[--timber-dark]/30 hover:border-[--accent]'}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[--accent] animate-spin mx-auto mb-4" />
              <p className="text-[--timber] font-medium">Завантаження...</p>
              <div className="mt-4 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[--accent] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{progress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-[--timber-dark]/40 mb-4" />
              <p className="text-[--timber-dark] font-medium mb-1">
                Перетягніть зображення сюди
              </p>
              <p className="text-sm text-gray-500">або клацніть, щоб вибрати файл</p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, WebP, GIF • Макс {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
              {compress && (
                <p className="text-xs text-gray-400 mt-1">
                  Буде оптимізовано до ~200KB
                </p>
              )}
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
