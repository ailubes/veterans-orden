import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Nova Poshta API v2.0 (official, no API key required for public endpoints)
const NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';

interface NovaPoshtaWarehouse {
  Ref: string;
  Description: string;
  ShortAddress: string;
  Number: string;
  CityDescription: string;
  CityRef: string;
  SettlementAreaDescription: string;
  TypeOfWarehouse: string;
  WarehouseStatus: string;
  CategoryOfWarehouse: string;
}

interface NovaPoshtaCity {
  Ref: string;
  Description: string;
  AreaDescription: string;
}

/**
 * GET /api/nova-poshta/divisions
 *
 * Proxy for Nova Poshta API to search warehouses/divisions
 *
 * Query params:
 * - city: City name to search
 * - cityRef: City reference (if known, for faster warehouse lookup)
 * - limit: Max results (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || '';
    const cityRef = searchParams.get('cityRef') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!city || city.length < 2) {
      return NextResponse.json({ divisions: [] });
    }

    // Step 1: Search for cities matching the query
    const citiesResponse = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: city,
          Limit: '20',
          Page: '1',
        },
      }),
    });

    const citiesData = await citiesResponse.json();

    if (!citiesData.success || !citiesData.data?.[0]?.Addresses?.length) {
      return NextResponse.json({ divisions: [] });
    }

    const cities: NovaPoshtaCity[] = citiesData.data[0].Addresses.map((addr: { DeliveryCity: string; Present: string; Area: string }) => ({
      Ref: addr.DeliveryCity,
      Description: addr.Present,
      AreaDescription: addr.Area,
    }));

    // Step 2: Get warehouses for the first matching city (or use provided cityRef)
    const targetCityRef = cityRef || cities[0]?.Ref;

    if (!targetCityRef) {
      return NextResponse.json({ divisions: [], cities });
    }

    const warehousesResponse = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: targetCityRef,
          Limit: String(limit),
          Page: '1',
        },
      }),
    });

    const warehousesData = await warehousesResponse.json();

    if (!warehousesData.success) {
      console.error('[Nova Poshta API] Warehouses error:', warehousesData.errors);
      return NextResponse.json({ divisions: [], cities });
    }

    // Transform warehouses to our format
    const divisions = (warehousesData.data || []).map((wh: NovaPoshtaWarehouse) => ({
      id: wh.Ref,
      name: wh.Description,
      shortName: `Відділення №${wh.Number}`,
      number: wh.Number,
      city: wh.CityDescription,
      cityRef: wh.CityRef,
      region: wh.SettlementAreaDescription,
      address: wh.ShortAddress,
      status: wh.WarehouseStatus === 'Working' ? 'Working' : 'NotWorking',
      category: mapWarehouseCategory(wh.CategoryOfWarehouse),
    }));

    return NextResponse.json({
      divisions,
      cities: cities.map(c => ({
        ref: c.Ref,
        name: c.Description,
        region: c.AreaDescription,
      })),
    });
  } catch (error) {
    console.error('[Nova Poshta API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function mapWarehouseCategory(category: string): string {
  // Map Nova Poshta category to our simplified categories
  if (category?.includes('Postomat') || category?.includes('поштомат')) {
    return 'Postomat';
  }
  if (category?.includes('Cargo') || category?.includes('вантаж')) {
    return 'CargoBranch';
  }
  return 'Branch';
}
