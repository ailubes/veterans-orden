import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getStorageRegion(): string {
  return process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';
}

function getStorageAccessKey(): string | undefined {
  return process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
}

function getStorageSecretKey(): string | undefined {
  return process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;
}

function getStorageBucketName(): string | undefined {
  return process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
}

function getStorageEndpoint(): string | undefined {
  return process.env.S3_ENDPOINT_URL || process.env.AWS_S3_ENDPOINT_URL;
}

function getPublicStorageEndpoint(): string | undefined {
  return process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || getStorageEndpoint();
}

function buildPublicUrl(bucketName: string, s3Key: string): string {
  const publicEndpoint = getPublicStorageEndpoint();

  if (publicEndpoint) {
    return `${publicEndpoint.replace(/\/$/, '')}/${bucketName}/${s3Key}`;
  }

  const region = getStorageRegion();
  return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
}

// S3 client configuration (server-side only)
function getS3Client() {
  const accessKeyId = getStorageAccessKey();
  const secretAccessKey = getStorageSecretKey();
  const endpoint = getStorageEndpoint();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      `S3 credentials missing. S3_ACCESS_KEY/AWS_ACCESS_KEY_ID: ${accessKeyId ? 'set' : 'MISSING'}, S3_SECRET_KEY/AWS_SECRET_ACCESS_KEY: ${secretAccessKey ? 'set' : 'MISSING'}`
    );
  }

  return new S3Client({
    region: getStorageRegion(),
    ...(endpoint ? { endpoint } : {}),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Required for MinIO and other S3-compatible endpoints
    forcePathStyle: Boolean(endpoint),
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
 * ├── products/
 * │   ├── featured/      - Product cover images
 * │   ├── gallery/       - Product gallery images
 * │   └── digital/       - Digital product assets (PDFs, ZIPs, etc.)
 * └── uploads/
 *     └── other/         - Miscellaneous uploads
 */
export type UploadContext =
  | 'user_avatar'
  | 'news_featured'
  | 'news_inline'
  | 'news_document'
  | 'event_image'
  | 'task_proof'
  | 'product_featured'
  | 'product_gallery'
  | 'product_digital_asset'
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

    // Task proofs/screenshots
    task_proof: 'task-proofs',

    // Marketplace Products
    product_featured: 'products/featured',
    product_gallery: 'products/gallery',
    product_digital_asset: 'products/digital',

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
    if (!getStorageAccessKey() || !getStorageSecretKey()) {
      throw new Error(
        'S3 credentials not configured. Please set S3_ACCESS_KEY/S3_SECRET_KEY or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.'
      );
    }

    const bucketName = getStorageBucketName();
    if (!bucketName) {
      throw new Error('S3 bucket not configured. Please set S3_BUCKET_NAME or AWS_S3_BUCKET.');
    }

    const s3Client = getS3Client();

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
    const publicUrl = buildPublicUrl(bucketName, s3Key);

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
  const bucketName = getStorageBucketName();
  if (!bucketName) {
    throw new Error('S3 bucket not configured. Please set S3_BUCKET_NAME or AWS_S3_BUCKET.');
  }

  const uniqueFilename = generateUniqueFilename(filename);
  const s3Key = getFilePath(context, uniqueFilename);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: file,
    ContentType: fileType,
  });

  await s3Client.send(command);

  const publicUrl = buildPublicUrl(bucketName, s3Key);

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
  const bucketName = getStorageBucketName();
  if (!bucketName) {
    throw new Error('S3 bucket not configured. Please set S3_BUCKET_NAME or AWS_S3_BUCKET.');
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  await s3Client.send(command);
}

/**
 * Allowed MIME types by category
 */
const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const documentTypes = [
  // PDF
  'application/pdf',
  // Microsoft Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Microsoft Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Microsoft PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // OpenDocument formats
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  // Text formats
  'text/plain',
  'text/markdown',
  'text/rtf',
  'application/rtf',
  // Rich text
  'application/x-rtf',
];

/**
 * File size limits (after optimization)
 * - User avatars: 100KB (optimized on client)
 * - News images: 200KB (optimized on client)
 * - Documents: 5MB (no optimization)
 * - Product images: 200KB (optimized on client)
 * - Digital assets: 100MB (no optimization)
 */
export const FILE_SIZE_LIMITS = {
  user_avatar: 100 * 1024, // 100KB
  news_featured: 200 * 1024, // 200KB
  news_inline: 200 * 1024, // 200KB
  news_document: 5 * 1024 * 1024, // 5MB
  event_image: 200 * 1024, // 200KB
  task_proof: 100 * 1024, // 100KB - compressed screenshots
  product_featured: 200 * 1024, // 200KB
  product_gallery: 150 * 1024, // 150KB - smaller for gallery images
  product_digital_asset: 100 * 1024 * 1024, // 100MB - large files for digital products
  other: 5 * 1024 * 1024, // 5MB
} as const;

/**
 * Max file size before optimization (what user can upload)
 */
export const MAX_UPLOAD_SIZE = {
  user_avatar: 10 * 1024 * 1024, // 10MB before compression
  news_featured: 10 * 1024 * 1024, // 10MB before compression
  news_inline: 10 * 1024 * 1024, // 10MB before compression
  news_document: 5 * 1024 * 1024, // 5MB (no compression)
  event_image: 10 * 1024 * 1024, // 10MB before compression
  task_proof: 10 * 1024 * 1024, // 10MB before compression
  product_featured: 10 * 1024 * 1024, // 10MB before compression
  product_gallery: 10 * 1024 * 1024, // 10MB before compression
  product_digital_asset: 100 * 1024 * 1024, // 100MB (no compression)
  other: 5 * 1024 * 1024, // 5MB
} as const;

/**
 * Validate file type based on upload context
 */
export function isValidFileType(fileType: string, context: string): boolean {
  const digitalAssetTypes = [
    ...imageTypes,
    ...documentTypes,
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
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

    // Task proofs - screenshots
    task_proof: imageTypes,

    // Marketplace Products
    product_featured: imageTypes,
    product_gallery: imageTypes,
    product_digital_asset: digitalAssetTypes,

    // Other - allow both images and documents
    other: [...imageTypes, ...documentTypes],
  };

  const allowed = allowedTypes[context] || imageTypes;
  return allowed.includes(fileType);
}

/**
 * Validate file size based on upload context
 * This checks the max upload size (before optimization)
 */
export function isValidFileSize(fileSize: number, context: string): boolean {
  const maxSize = MAX_UPLOAD_SIZE[context as keyof typeof MAX_UPLOAD_SIZE] || MAX_UPLOAD_SIZE.other;
  return fileSize <= maxSize;
}

/**
 * Get target file size for optimization
 */
export function getTargetFileSize(context: string): number {
  return FILE_SIZE_LIMITS[context as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.other;
}

/**
 * Extract S3 key from public URL
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const bucketName = getStorageBucketName();
    if (!bucketName) return null;
    const pattern = new RegExp(`${bucketName}/(.+)$`);
    const match = url.match(pattern);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
