'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, AlertCircle, Star } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { UploadContext, PresignedUrlResponse } from '@/types/upload';

interface MultipleImageUploadZoneProps {
  value: string[]; // Array of image URLs
  onChange: (urls: string[]) => void;
  label: string;
  maxImages?: number; // Default: 10
  maxSize?: number; // in bytes
  context?: UploadContext;
  compress?: boolean;
  className?: string;
}

export function MultipleImageUploadZone({
  value = [],
  onChange,
  label,
  maxImages = 10,
  maxSize = 10485760, // 10MB default
  context = 'product_gallery',
  compress = true,
  className = '',
}: MultipleImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
      await handleFiles(files);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFiles(Array.from(files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setError(null);

    // Check if we have room for more images
    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      setError(`Максимум ${maxImages} зображень`);
      return;
    }

    // Limit to remaining slots
    const filesToUpload = files.slice(0, remainingSlots);

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = filesToUpload.filter(f => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      setError('Непідтримуваний формат. Використовуйте JPG, PNG, WebP або GIF');
      return;
    }

    // Validate file sizes
    const oversizedFiles = filesToUpload.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      setError(`Деякі файли занадто великі. Максимум: ${maxSizeMB}MB`);
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(Math.round(((i + 0.2) / filesToUpload.length) * 100));

        // Compress image
        let fileToUpload = file;
        if (compress) {
          fileToUpload = await imageCompression(file, {
            maxSizeMB: 0.15, // 150KB target for gallery images
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: 'image/jpeg',
            initialQuality: 0.85,
          });
          console.log(
            `[Image ${i + 1}] ${(file.size / 1024).toFixed(0)}KB → ${(fileToUpload.size / 1024).toFixed(0)}KB`
          );
        }

        setUploadProgress(Math.round(((i + 0.5) / filesToUpload.length) * 100));

        // Request presigned URL
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

        setUploadProgress(Math.round(((i + 0.7) / filesToUpload.length) * 100));

        // Upload to S3
        const uploadResponse = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': fileToUpload.type,
          },
          body: fileToUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Помилка при завантаженні файлу ${i + 1}`);
        }

        uploadedUrls.push(data.publicUrl);
        setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
      }

      // Update parent with new URLs (append to existing)
      onChange([...value, ...uploadedUrls]);

      // Reset state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      console.error('[Multiple Image Upload] Error:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const newUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(newUrls);
    setError(null);
  };

  const handleClick = () => {
    if (!isUploading && value.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[--text-100]">{label}</label>
        <span className="text-sm text-gray-500">
          {value.length} / {maxImages}
        </span>
      </div>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group">
              <div className="relative h-40 bg-gray-100 border-2 border-[--text-100] overflow-hidden">
                <Image
                  src={url}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-[--accent] text-white px-2 py-1 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Головне
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Видалити зображення"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {value.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isUploading ? handleClick : undefined}
          className={`
            relative h-48 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center
            transition-all cursor-pointer
            ${isDragging ? 'border-[--accent] bg-[--accent]/5' : 'border-[--text-100]/30 hover:border-[--accent]'}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[--accent] animate-spin mx-auto mb-4" />
              <p className="text-[--muted-500] font-medium">Завантаження...</p>
              <div className="mt-4 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[--accent] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-[--text-100]/40 mb-4" />
              <p className="text-[--text-100] font-medium mb-1">
                Перетягніть зображення сюди
              </p>
              <p className="text-sm text-gray-500">або клацніть, щоб вибрати файли</p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, WebP, GIF • Макс {(maxSize / 1024 / 1024).toFixed(0)}MB кожен
              </p>
              {compress && (
                <p className="text-xs text-gray-400 mt-1">
                  Буде оптимізовано до ~150KB кожне
                </p>
              )}
              <p className="text-xs text-[--accent] font-bold mt-2">
                Перше зображення — головне
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
            multiple
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

      {/* Hint */}
      {value.length > 0 && (
        <p className="text-xs text-gray-500">
          Перше зображення використовується як головне зображення товару
        </p>
      )}
    </div>
  );
}
