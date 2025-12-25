/**
 * Upload context types
 */
export type UploadContext = 'news_featured' | 'news_inline' | 'news_document';

/**
 * Request to generate presigned URL
 */
export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  context: UploadContext;
}

/**
 * Response from presigned URL API
 */
export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  s3Key: string;
  expiresIn: number;
}

/**
 * Upload progress tracking
 */
export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  publicUrl?: string;
}

/**
 * File validation result
 */
export interface FileValidation {
  valid: boolean;
  error?: string;
}
