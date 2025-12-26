import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const NOVA_POSHTA_API_URL = 'https://api.novapost.com/v.1.0/divisions';

interface NovaPoshtaDivision {
  id: string;
  name: string;
  shortName: string;
  number: string;
  countryCode: string;
  settlement: {
    name: string;
    region?: {
      name: string;
    };
  };
  address: string;
  status: string;
  divisionCategory: string;
  latitude: number;
  longitude: number;
}

/**
 * GET /api/nova-poshta/divisions
 *
 * Proxy for Nova Poshta divisions API to avoid CORS issues
 *
 * Query params:
 * - city: City name to search (will be wrapped with wildcards)
 * - limit: Max results (default 50)
 * - category: Filter by category (PostBranch, CargoBranch, Postomat, PUDO)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || '';
    const limit = searchParams.get('limit') || '50';
    const category = searchParams.get('category');

    if (!city || city.length < 2) {
      return NextResponse.json({ divisions: [] });
    }

    // Build Nova Poshta API URL
    const apiUrl = new URL(NOVA_POSHTA_API_URL);
    apiUrl.searchParams.append('countryCodes[]', 'UA');
    apiUrl.searchParams.append('limit', limit);
    apiUrl.searchParams.append('name', `*${city}*`);

    if (category) {
      apiUrl.searchParams.append('divisionCategories[]', category);
    }

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'uk',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('[Nova Poshta API] Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch from Nova Poshta API' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform response to simpler format
    const divisions = (data || []).map((div: NovaPoshtaDivision) => ({
      id: div.id,
      name: div.name,
      shortName: div.shortName,
      number: div.number,
      city: div.settlement?.name || '',
      region: div.settlement?.region?.name || '',
      address: div.address,
      status: div.status,
      category: div.divisionCategory,
      latitude: div.latitude,
      longitude: div.longitude,
    }));

    return NextResponse.json({ divisions });
  } catch (error) {
    console.error('[Nova Poshta API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
