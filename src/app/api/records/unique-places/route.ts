import { NextRequest, NextResponse } from 'next/server';
import { getRecordModel } from '@/lib/models/record';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase() || '';

    const RecordModel = await getRecordModel();

    const result = await RecordModel.findAll({
      attributes: ['place'],
      group: ['place'],
      order: [['place', 'ASC']],
      limit: query ? undefined : 10,
      raw: true,
    });

    let places = result
      .map((row: any) => row.place)
      .filter((place: string) => place && place.trim() !== '');

    if (query) {
      places = places.filter((place: string) =>
        place.toLowerCase().includes(query)
      );
    }

    return NextResponse.json(places);
  } catch (error) {
    console.error('Error fetching unique places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}
