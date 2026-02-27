import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/get-user';
import { createServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

const ALLOWED_MIME: Record<string, string[]> = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
  ],
  media: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
  ],
  press_kit: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export async function GET(request: NextRequest) {
  const { isAdmin, error } = await requireAdminUser(request);
  if (!isAdmin) {
    return NextResponse.json({ error: error || 'Forbidden' }, { status: 403 });
  }

  const category = request.nextUrl.searchParams.get('category');
  if (!category || !['documents', 'media', 'press_kit'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from('organization_documents')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { isAdmin, user, error } = await requireAdminUser(request);
  if (!isAdmin) {
    return NextResponse.json({ error: error || 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const name = formData.get('name') as string | null;
  const category = formData.get('category') as string | null;

  if (!file || !name || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['documents', 'media', 'press_kit'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  if (file.size > 10485760) {
    return NextResponse.json({ error: 'Файл перевищує максимальний розмір 10 МБ' }, { status: 400 });
  }

  const allowedTypes = ALLOWED_MIME[category];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Недозволений тип файлу' }, { status: 400 });
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${category}/${randomUUID()}-${sanitizedName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createServiceClient();
  const { error: uploadError } = await supabase.storage
    .from('org-documents')
    .upload(storagePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from('org-documents')
    .getPublicUrl(storagePath);

  const { data: doc, error: insertError } = await supabase
    .from('organization_documents')
    .insert({
      name,
      url: urlData.publicUrl,
      storage_path: storagePath,
      category,
      size_bytes: file.size,
      mime_type: file.type,
      created_by: user!.id,
    })
    .select()
    .single();

  if (insertError) {
    // Clean up storage on DB failure
    await supabase.storage.from('org-documents').remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(doc, { status: 201 });
}
