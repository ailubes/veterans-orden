import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import {
  uploadToS3,
  isValidFileType,
  isValidFileSize,
} from '@/lib/storage/s3-storage';

export const dynamic = 'force-dynamic';

// Allowed contexts for public upload
const PUBLIC_UPLOAD_CONTEXTS = ['task_proof', 'user_avatar'];

/**
 * POST /api/upload
 *
 * Direct file upload to S3 for authenticated users
 * Supports FormData with file and context
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const context = (formData.get('context') as string) || 'task_proof';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate context
    if (!PUBLIC_UPLOAD_CONTEXTS.includes(context)) {
      return NextResponse.json(
        { error: 'Invalid upload context' },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!isValidFileType(file.type, context)) {
      return NextResponse.json(
        { error: `Непідтримуваний тип файлу: ${file.type}` },
        { status: 400 }
      );
    }

    // 5. Validate file size (before compression limit - 10MB)
    if (!isValidFileSize(file.size, context)) {
      return NextResponse.json(
        { error: 'Файл занадто великий. Максимум: 10MB' },
        { status: 400 }
      );
    }

    // 6. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Upload to S3
    const { publicUrl, s3Key } = await uploadToS3({
      file: buffer,
      filename: file.name,
      fileType: file.type,
      context,
    });

    // 8. Return response
    return NextResponse.json({
      url: publicUrl,
      s3Key,
      size: buffer.length,
    });
  } catch (error) {
    console.error('[Upload API] Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Помилка завантаження файлу',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
