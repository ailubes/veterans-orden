import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import {
  generatePresignedUploadUrl,
  isValidFileType,
  isValidFileSize,
} from '@/lib/storage/s3-storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/upload
 *
 * Generate presigned URL for direct S3 upload
 *
 * Request body:
 * {
 *   fileName: string,
 *   fileType: string,
 *   fileSize: number,
 *   context: 'news_featured' | 'news_inline' | 'news_document'
 * }
 *
 * Response:
 * {
 *   uploadUrl: string,    // Presigned URL for PUT request
 *   publicUrl: string,    // Public URL to access file after upload
 *   s3Key: string,        // S3 object key
 *   expiresIn: number     // Expiration time in seconds (300 = 5 minutes)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication and authorization
    const { profile: adminProfile } = await getAdminProfileFromRequest(request);

    const allowedRoles = ['super_admin', 'admin', 'regional_leader', 'news_editor'];
    if (!allowedRoles.includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Недостатньо прав доступу' }, { status: 403 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { fileName, fileType, fileSize, context } = body;

    // 3. Validate request
    if (!fileName || !fileType || !fileSize || !context) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові параметри' },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!isValidFileType(fileType, context)) {
      return NextResponse.json(
        { error: `Непідтримуваний тип файлу: ${fileType}` },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (!isValidFileSize(fileSize, context)) {
      const maxSizeMB = context === 'news_document' ? 50 : 10;
      return NextResponse.json(
        { error: `Файл занадто великий. Максимум: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // 6. Generate presigned URL
    const { uploadUrl, publicUrl, s3Key } = await generatePresignedUploadUrl({
      filename: fileName,
      fileType: fileType,
      context: context,
    });

    // 7. Return response
    return NextResponse.json({
      uploadUrl,
      publicUrl,
      s3Key,
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    console.error('[Upload API] Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      {
        error: 'Помилка при створенні URL для завантаження',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
