import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/achievements/[id]/badge
 * Generates a downloadable SVG certificate badge for an achievement
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('auth_id', authUser.id)
      .single();

    if (userError || !dbUser) {
      console.error('[Badge] Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: achievementId } = await params;

    // Get achievement
    const { data: achievement, error: achievementError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('id', achievementId)
      .eq('user_id', dbUser.id)
      .single();

    if (achievementError) {
      if (achievementError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Achievement not found or does not belong to user' },
          { status: 404 }
        );
      }
      console.error('[Badge] Error fetching achievement:', achievementError);
      return NextResponse.json(
        { error: 'Failed to fetch achievement' },
        { status: 500 }
      );
    }

    // Format date in Ukrainian
    const earnedDate = new Date(achievement.earned_at);
    const dateStr = earnedDate.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate SVG certificate with Timber design
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#f4f1eb"/>

  <!-- Border -->
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#2c2824" stroke-width="4"/>

  <!-- Joints (corners) -->
  <rect x="20" y="20" width="6" height="6" fill="#1a1816"/>
  <rect x="774" y="20" width="6" height="6" fill="#1a1816"/>
  <rect x="20" y="574" width="6" height="6" fill="#1a1816"/>
  <rect x="774" y="574" width="6" height="6" fill="#1a1816"/>

  <!-- Decorative horizontal beams -->
  <line x1="60" y1="100" x2="740" y2="100" stroke="#4a4238" stroke-width="2"/>
  <line x1="60" y1="500" x2="740" y2="500" stroke="#4a4238" stroke-width="2"/>

  <!-- Header -->
  <text x="400" y="80" font-family="Syne, sans-serif" font-size="32" font-weight="700" text-anchor="middle" fill="#2c2824">
    СЕРТИФІКАТ ДОСЯГНЕННЯ
  </text>

  <!-- Organization -->
  <text x="400" y="130" font-family="Space Mono, monospace" font-size="16" text-anchor="middle" fill="#4a4238">
    МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ
  </text>

  <!-- Achievement Title -->
  <text x="400" y="220" font-family="Syne, sans-serif" font-size="36" font-weight="700" text-anchor="middle" fill="#d45d3a">
    ${escapeXml(achievement.title_uk)}
  </text>

  <!-- Description -->
  <text x="400" y="280" font-family="Space Mono, monospace" font-size="18" text-anchor="middle" fill="#2c2824">
    ${escapeXml(achievement.description_uk)}
  </text>

  <!-- Separator -->
  <line x1="250" y1="320" x2="550" y2="320" stroke="#d45d3a" stroke-width="2"/>

  <!-- Recipient label -->
  <text x="400" y="370" font-family="Space Mono, monospace" font-size="14" text-anchor="middle" fill="#4a4238">
    Нагороджено:
  </text>

  <!-- Recipient name -->
  <text x="400" y="410" font-family="Syne, sans-serif" font-size="28" font-weight="600" text-anchor="middle" fill="#2c2824">
    ${escapeXml(dbUser.full_name || dbUser.email || 'Член Мережі')}
  </text>

  <!-- Date -->
  <text x="400" y="460" font-family="Space Mono, monospace" font-size="16" text-anchor="middle" fill="#4a4238">
    ${escapeXml(dateStr)}
  </text>

  <!-- Footer -->
  <text x="400" y="540" font-family="Space Mono, monospace" font-size="12" text-anchor="middle" fill="#4a4238">
    ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!
  </text>

  <!-- Grain texture pattern -->
  <defs>
    <pattern id="grain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="transparent"/>
      <circle cx="10" cy="10" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="30" cy="25" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="50" cy="15" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="70" cy="35" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="90" cy="20" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="20" cy="45" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="40" cy="60" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="60" cy="50" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="80" cy="70" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="15" cy="80" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="35" cy="90" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="55" cy="85" r="0.5" fill="#2c2824" opacity="0.05"/>
      <circle cx="75" cy="95" r="0.5" fill="#2c2824" opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#grain)" opacity="0.3"/>
</svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="dosyagnennya-${achievement.achievement_key}.svg"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('[Badge] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
