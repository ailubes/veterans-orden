'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { DefaultAvatar, type UserSex } from '@/components/ui/default-avatar';

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string | null;
  sex?: UserSex;
  onUploadComplete: (avatarUrl: string) => void;
}

export function ProfilePhotoUpload({
  currentAvatarUrl,
  sex,
  onUploadComplete,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadProgress(0);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Будь ласка, оберіть файл зображення');
      return;
    }

    // Validate file size (10MB max before compression)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Максимальний розмір файлу: 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Always compress avatar to ~100KB, 400x400 max
      const fileToUpload = await imageCompression(file, {
        maxSizeMB: 0.1, // 100KB target
        maxWidthOrHeight: 400, // Avatar size
        useWebWorker: true,
        fileType: 'image/jpeg', // Convert to JPEG for better compression
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(fileToUpload);

      setUploadProgress(30);

      // Request presigned URL from API
      const presignResponse = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: fileToUpload.type,
          fileSize: fileToUpload.size,
        }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Не вдалося отримати URL для завантаження';
        throw new Error(errorMessage);
      }

      const { uploadUrl, publicUrl } = await presignResponse.json();
      setUploadProgress(50);

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileToUpload.type,
        },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error('Не вдалося завантажити файл');
      }

      setUploadProgress(80);

      // Update database with new avatar URL
      const updateResponse = await fetch('/api/user/upload-avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Не вдалося оновити профіль');
      }

      setUploadProgress(100);
      onUploadComplete(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
      setPreviewUrl(currentAvatarUrl || null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-line bg-bronze/10 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <DefaultAvatar sex={sex} size="xl" showAnimation />
            )}
          </div>

          {/* Remove button */}
          {previewUrl && !uploading && (
            <button
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              aria-label="Видалити фото"
            >
              <X size={16} />
            </button>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="absolute inset-0 bg-panel-850/80 rounded-full flex items-center justify-center">
              <div className="text-canvas text-sm font-bold">{uploadProgress}%</div>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload"
            disabled={uploading}
          />

          <label
            htmlFor="avatar-upload"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-panel-850 text-canvas font-bold text-sm font-mono uppercase tracking-wider cursor-pointer transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_var(--accent)] ${
              uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            <Upload size={16} />
            {uploading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ ФОТО'}
          </label>

          <p className="text-xs text-muted-500 mt-2">
            JPG, PNG, WebP або GIF. Буде оптимізовано до 100KB.
          </p>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
