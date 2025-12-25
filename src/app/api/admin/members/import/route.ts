import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

interface ImportRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  patronymic?: string;
  date_of_birth?: string;
  city?: string;
  oblast_name?: string;
  role?: string;
  membership_tier?: string;
}

interface ImportResult {
  success: boolean;
  row: number;
  email: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Only super_admin and admin can import members
    if (!['super_admin', 'admin'].includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { rows } = body as { rows: ImportRow[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Fetch all oblasts for mapping
    const { data: oblasts } = await supabase
      .from('oblasts')
      .select('id, name');

    const oblastMap = new Map(
      (oblasts || []).map((o) => [o.name.toLowerCase(), o.id])
    );

    const results: ImportResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        if (!row.first_name || !row.last_name || !row.email) {
          results.push({
            success: false,
            row: rowNumber,
            email: row.email || 'N/A',
            error: 'Відсутні обов\'язкові поля (ім\'я, прізвище, email)',
          });
          errorCount++;
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          results.push({
            success: false,
            row: rowNumber,
            email: row.email,
            error: 'Невалідний формат email',
          });
          errorCount++;
          continue;
        }

        // Check if email already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', row.email)
          .single();

        if (existingUser) {
          results.push({
            success: false,
            row: rowNumber,
            email: row.email,
            error: 'Email вже існує в системі',
          });
          errorCount++;
          continue;
        }

        // Map oblast name to ID
        let oblastId = null;
        if (row.oblast_name) {
          oblastId = oblastMap.get(row.oblast_name.toLowerCase());
          if (!oblastId) {
            results.push({
              success: false,
              row: rowNumber,
              email: row.email,
              error: `Область "${row.oblast_name}" не знайдена`,
            });
            errorCount++;
            continue;
          }
        }

        // Validate role
        const validRoles = [
          'free_viewer',
          'prospect',
          'silent_member',
          'full_member',
          'group_leader',
          'regional_leader',
        ];
        const role = row.role || 'free_viewer';
        if (!validRoles.includes(role)) {
          results.push({
            success: false,
            row: rowNumber,
            email: row.email,
            error: `Невалідна роль: "${row.role}"`,
          });
          errorCount++;
          continue;
        }

        // Validate membership tier
        const validTiers = [
          'free',
          'basic_49',
          'supporter_100',
          'supporter_200',
          'patron_500',
        ];
        const tier = row.membership_tier || 'free';
        if (!validTiers.includes(tier)) {
          results.push({
            success: false,
            row: rowNumber,
            email: row.email,
            error: `Невалідний план: "${row.membership_tier}"`,
          });
          errorCount++;
          continue;
        }

        // Validate date of birth format (YYYY-MM-DD)
        let dateOfBirth = null;
        if (row.date_of_birth) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(row.date_of_birth)) {
            results.push({
              success: false,
              row: rowNumber,
              email: row.email,
              error: 'Дата народження має бути в форматі YYYY-MM-DD',
            });
            errorCount++;
            continue;
          }
          dateOfBirth = row.date_of_birth;
        }

        // Insert user
        const { error: insertError } = await supabase.from('users').insert({
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          email: row.email.toLowerCase().trim(),
          phone: row.phone?.trim() || null,
          patronymic: row.patronymic?.trim() || null,
          date_of_birth: dateOfBirth,
          city: row.city?.trim() || null,
          oblast_id: oblastId,
          role,
          membership_tier: tier,
          status: 'pending', // All imported members start as pending
          points: 0,
          level: 1,
        });

        if (insertError) {
          results.push({
            success: false,
            row: rowNumber,
            email: row.email,
            error: `Помилка БД: ${insertError.message}`,
          });
          errorCount++;
          continue;
        }

        // Success
        results.push({
          success: true,
          row: rowNumber,
          email: row.email,
        });
        successCount++;
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.push({
          success: false,
          row: rowNumber,
          email: row.email || 'N/A',
          error: 'Внутрішня помилка сервера',
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: rows.length,
        success: successCount,
        errors: errorCount,
      },
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
