import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 client configuration (server-side only)
function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  const endpoint = process.env.S3_ENDPOINT_URL;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      `S3 credentials missing. S3_ACCESS_KEY: ${accessKeyId ? 'set' : 'MISSING'}, S3_SECRET_KEY: ${secretAccessKey ? 'set' : 'MISSING'}`
    );
  }

  if (!endpoint) {
    throw new Error('S3_ENDPOINT_URL is not configured');
  }

  return new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Required for MinIO
    // Disable automatic checksum calculation for S3-compatible storage
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalFilename.split('.').pop();
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');

  // Sanitize filename (remove special chars, keep only alphanumeric and hyphens)
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  return `${sanitized}-${timestamp}-${random}.${ext}`;
}

/**
 * Storage folder structure:
 *
 * freepeople-data/
 * ├── avatars/           - User profile photos
 * ├── news/
 * │   ├── featured/      - Article cover/featured images
 * │   ├── inline/        - Images embedded in article content
 * │   └── documents/     - PDF and document attachments
 * ├── events/
 * │   └── images/        - Event cover images
 * └── uploads/
 *     └── other/         - Miscellaneous uploads
 */
export type UploadContext =
  | 'user_avatar'
  | 'news_featured'
  | 'news_inline'
  | 'news_document'
  | 'event_image'
  | 'other';

/**
 * Get file path based on context
 */
export function getFilePath(context: string, filename: string): string {
  const paths: Record<string, string> = {
    // User content
    user_avatar: 'avatars',

    // News/Articles
    news_featured: 'news/featured',
    news_inline: 'news/inline',
    news_document: 'news/documents',

    // Events
    event_image: 'events/images',

    // Other
    other: 'uploads/other',
  };

  const folder = paths[context] || 'uploads/other';
  return `${folder}/${filename}`;
}

/**
 * Generate presigned URL for direct upload to S3
 *
 * @param filename Original filename
 * @param fileType MIME type
 * @param context Upload context (news_featured, news_inline, etc.)
 * @returns Promise with uploadUrl and publicUrl
 */
export async function generatePresignedUploadUrl(params: {
  filename: string;
  fileType: string;
  context: string;
}): Promise<{ uploadUrl: string; publicUrl: string; s3Key: string }> {
  const { filename, fileType, context } = params;

  try {
    // Validate required env vars
    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      throw new Error('S3 credentials not configured. Please set S3_ACCESS_KEY and S3_SECRET_KEY.');
    }

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME not configured');
    }

    if (!process.env.NEXT_PUBLIC_S3_ENDPOINT_URL) {
      throw new Error('NEXT_PUBLIC_S3_ENDPOINT_URL not configured');
    }

    const s3Client = getS3Client();
    const bucketName = process.env.S3_BUCKET_NAME;

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(filename);
    const s3Key = getFilePath(context, uniqueFilename);

    // Create PUT command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: fileType,
    });

    // Generate presigned URL (valid for 5 minutes)
    // Include Content-Type in signed headers for S3-compatible storage
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
      unhoistableHeaders: new Set(['x-amz-checksum-crc32']),
      signableHeaders: new Set(['host', 'content-type']),
    });

    // Public URL for accessing the file
    const publicUrl = `${process.env.NEXT_PUBLIC_S3_ENDPOINT_URL}/${bucketName}/${s3Key}`;

    return {
      uploadUrl,
      publicUrl,
      s3Key,
    };
  } catch (error) {
    console.error('[S3 Storage] Error generating presigned URL:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      context,
      filename,
    });
    throw error;
  }
}

/**
 * Upload file directly to S3 (server-side)
 *
 * @param file File buffer
 * @param filename Original filename
 * @param fileType MIME type
 * @param context Upload context
 * @returns Promise with public URL
 */
export async function uploadToS3(params: {
  file: Buffer;
  filename: string;
  fileType: string;
  context: string;
}): Promise<{ publicUrl: string; s3Key: string }> {
  const { file, filename, fileType, context } = params;

  const s3Client = getS3Client();
  const bucketName = process.env.S3_BUCKET_NAME!;

  const uniqueFilename = generateUniqueFilename(filename);
  const s3Key = getFilePath(context, uniqueFilename);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: file,
    ContentType: fileType,
  });

  await s3Client.send(command);

  const publicUrl = `${process.env.NEXT_PUBLIC_S3_ENDPOINT_URL}/${bucketName}/${s3Key}`;

  return {
    publicUrl,
    s3Key,
  };
}

/**
 * Delete file from S3
 *
 * @param s3Key The S3 object key
 * @returns Promise<void>
 */
export async function deleteFromS3(s3Key: string): Promise<void> {
  const s3Client = getS3Client();
  const bucketName = process.env.S3_BUCKET_NAME!;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  await s3Client.send(command);
}

/**
 * Validate file type based on upload context
 */
export function isValidFileType(fileType: string, context: string): boolean {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const allowedTypes: Record<string, string[]> = {
    // User content
    user_avatar: imageTypes,

    // News/Articles
    news_featured: imageTypes,
    news_inline: imageTypes,
    news_document: documentTypes,

    // Events
    event_image: imageTypes,

    // Other - allow both images and documents
    other: [...imageTypes, ...documentTypes],
  };

  const allowed = allowedTypes[context] || imageTypes;
  return allowed.includes(fileType);
}

/**
 * Validate file size based on upload context
 */
export function isValidFileSize(fileSize: number, context: string): boolean {
  const maxImageSize = parseInt(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE || '10485760'); // 10MB
  const maxDocumentSize = parseInt(process.env.NEXT_PUBLIC_MAX_DOCUMENT_SIZE || '52428800'); // 50MB

  const maxSizes: Record<string, number> = {
    // User content
    user_avatar: 5 * 1024 * 1024, // 5MB

    // News/Articles
    news_featured: maxImageSize,
    news_inline: maxImageSize,
    news_document: maxDocumentSize,

    // Events
    event_image: maxImageSize,

    // Other
    other: maxDocumentSize,
  };

  const maxSize = maxSizes[context] || maxImageSize;
  return fileSize <= maxSize;
}

/**
 * Extract S3 key from public URL
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const bucketName = process.env.S3_BUCKET_NAME!;
    const pattern = new RegExp(`${bucketName}/(.+)$`);
    const match = url.match(pattern);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
