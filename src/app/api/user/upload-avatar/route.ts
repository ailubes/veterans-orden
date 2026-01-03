import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { generatePresignedUploadUrl } from '@/lib/storage/s3-storage';
import { validateBody } from '@/lib/validation/validate';
import { uploadAvatarSchema, updateAvatarUrlSchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/upload-avatar
 *
 * Generate presigned URL for user avatar upload
 * Authenticated users only
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Не авторизовано' }, { status: 401 });
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

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      request,
      uploadAvatarSchema
    );

    if (validationError) {
      return validationError;
    }

    if (!validatedData) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { fileName, fileType, fileSize } = validatedData;

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
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Не авторизовано' }, { status: 401 });
    }

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      request,
      updateAvatarUrlSchema
    );

    if (validationError) {
      return validationError;
    }

    if (!validatedData) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { avatarUrl } = validatedData;

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
