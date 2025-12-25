import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePresignedUploadUrl } from '@/lib/storage/s3-storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/upload-avatar
 *
 * Generate presigned URL for user avatar upload
 * Authenticated users only
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    // Get user profile to get their ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'Профіль не знайдено' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { fileName, fileType, fileSize } = body;

    // Validate required fields
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'fileName, fileType та fileSize є обов\'язковими' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Дозволені лише зображення (JPG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for avatars)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'Максимальний розмір файлу: 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename with user ID
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const uniqueFileName = `avatar-${userProfile.id}-${timestamp}.${extension}`;

    // Generate presigned URL for S3 upload
    const { uploadUrl, publicUrl, s3Key } = await generatePresignedUploadUrl({
      filename: uniqueFileName,
      fileType,
      context: 'user_avatar',
    });

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      s3Key,
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    console.error('[Avatar Upload API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      {
        error: 'Не вдалося створити URL для завантаження',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/upload-avatar
 *
 * Update user's avatar URL in database after successful upload
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json({ error: 'avatarUrl є обов\'язковим' }, { status: 400 });
    }

    // Update user's avatar_url in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('clerk_id', user.id);

    if (updateError) {
      console.error('[Avatar Upload API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Не вдалося оновити аватар' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, avatarUrl });
  } catch (error) {
    console.error('[Avatar Upload API] Error:', error);
    return NextResponse.json(
      { error: 'Не вдалося оновити аватар' },
      { status: 500 }
    );
  }
}
