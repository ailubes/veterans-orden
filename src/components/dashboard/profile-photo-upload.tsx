'use client';

import { useState, useRef } from 'react';
import { User, Upload, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete: (avatarUrl: string) => void;
}

export function ProfilePhotoUpload({
  currentAvatarUrl,
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

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Максимальний розмір файлу: 5MB');
      return;
    }

    try {
      setUploading(true);

      // Compress image if larger than 1MB
      let fileToUpload = file;
      if (file.size > 1024 * 1024) {
        setUploadProgress(10);
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
      }

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
        throw new Error(errorData.error || 'Не вдалося отримати URL для завантаження');
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
          <div className="w-32 h-32 rounded-full border-4 border-timber-dark bg-timber-beam/10 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-timber-beam" />
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
            <div className="absolute inset-0 bg-timber-dark/80 rounded-full flex items-center justify-center">
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
            className={`inline-flex items-center gap-2 px-6 py-3 bg-timber-dark text-canvas font-bold text-sm cursor-pointer hover:bg-accent transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload size={16} />
            {uploading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ ФОТО'}
          </label>

          <p className="text-xs text-timber-beam mt-2">
            JPG, PNG, WebP або GIF. Максимум 5MB.
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
