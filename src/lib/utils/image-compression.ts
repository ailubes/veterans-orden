/**
 * Image compression utility for client-side image optimization
 * Compresses images to a target size (default 100KB) while maintaining quality
 */

export interface CompressOptions {
  maxSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxSizeKB: 100,
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'image/jpeg',
};

/**
 * Compress an image file to target size
 * Uses canvas to resize and compress
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxSizeBytes = opts.maxSizeKB * 1024;

  // If file is already small enough and is JPEG/WebP, return as-is
  if (file.size <= maxSizeBytes && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > opts.maxWidth) {
        height = (height * opts.maxWidth) / width;
        width = opts.maxWidth;
      }

      if (height > opts.maxHeight) {
        width = (width * opts.maxHeight) / height;
        height = opts.maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Binary search for optimal quality
      let quality = opts.quality;
      let minQuality = 0.1;
      let maxQuality = opts.quality;
      let resultBlob: Blob | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            attempts++;

            if (blob.size <= maxSizeBytes || attempts >= maxAttempts) {
              // Success or max attempts reached
              resultBlob = blob;
              const compressedFile = new File(
                [resultBlob],
                file.name.replace(/\.[^.]+$/, '.jpg'),
                { type: opts.format }
              );
              resolve(compressedFile);
            } else if (blob.size > maxSizeBytes) {
              // Too large, reduce quality
              maxQuality = quality;
              quality = (minQuality + quality) / 2;
              tryCompress();
            } else {
              // Could be larger, increase quality
              minQuality = quality;
              quality = (quality + maxQuality) / 2;
              tryCompress();
            }
          },
          opts.format,
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert a Blob to a File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Get file from clipboard paste event
 */
export function getImageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        // Rename pasted images to something meaningful
        const extension = file.type.split('/')[1] || 'png';
        const timestamp = Date.now();
        const newFile = new File(
          [file],
          `screenshot-${timestamp}.${extension}`,
          { type: file.type }
        );
        return newFile;
      }
    }
  }

  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
