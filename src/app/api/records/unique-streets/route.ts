import { NextRequest, NextResponse } from 'next/server';
import { getRecordModel } from '@/lib/models/record';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase() || '';

    const RecordModel = await getRecordModel();

    const result = await RecordModel.findAll({
      attributes: ['street'],
      group: ['street'],
      order: [['street', 'ASC']],
      limit: query ? undefined : 10,
      raw: true,
    });

    let streets = result
      .map((row: any) => row.street)
      .filter((street: string) => street && street.trim() !== '');

    if (query) {
      streets = streets.filter((street: string) =>
        street.toLowerCase().includes(query)
      );
    }

    return NextResponse.json(streets);
  } catch (error) {
    console.error('Error fetching unique streets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streets' },
      { status: 500 }
    );
  }
}
