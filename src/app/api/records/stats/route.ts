import { NextResponse } from 'next/server';
import { getRecordModel } from '../../../../lib/models/record';

export async function GET() {
  try {
    const RecordModel = await getRecordModel();
    const totalRecords = await RecordModel.count();
    const totalGoldCount = await RecordModel.count({
      where: { itemType: 'Gold' },
    });
    const totalSilverCount = await RecordModel.count({
      where: { itemType: 'Silver' },
    });
    const totalWeightGrams = Number(
      (await RecordModel.sum('weightGrams')) || 0
    );
    const totalAmount = Number((await RecordModel.sum('amount')) || 0);

    return NextResponse.json({
      totalRecords,
      totalGoldCount,
      totalSilverCount,
      totalWeightGrams,
      totalAmount,
    });
  } catch (err) {
    console.error('Stats error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
