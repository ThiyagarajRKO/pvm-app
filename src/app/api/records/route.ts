import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRecordModel } from '@/lib/models/record';
import { recordCreateSchema } from '@/lib/validators/record';
import { Op } from 'sequelize';
import { withAuth } from '@/lib/auth-middleware';

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  itemType: z.enum(['Gold', 'Silver']).optional(),
  status: z.enum(['active', 'archived', 'big']).optional(),
  street: z.string().optional(),
  place: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'weightGrams']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const url = new URL(req.url);
    const qs = Object.fromEntries(url.searchParams.entries());
    const parsed = querySchema.parse(qs);

    const page = Math.max(1, Number(parsed.page || 1));
    const limit = Math.min(100, Math.max(1, Number(parsed.limit || 20)));
    const offset = (page - 1) * limit;

    const where: any = {};
    if (parsed.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${parsed.search}%` } },
        { fatherName: { [Op.iLike]: `%${parsed.search}%` } },
        { place: { [Op.iLike]: `%${parsed.search}%` } },
        { mobile: { [Op.iLike]: `%${parsed.search}%` } },
      ];
    }
    if (parsed.itemType) where.itemType = parsed.itemType;
    if (parsed.status) where.itemCategory = parsed.status;
    if (parsed.street && parsed.street.trim() !== '')
      where.street = { [Op.iLike]: parsed.street };
    if (parsed.place && parsed.place.trim() !== '')
      where.place = { [Op.iLike]: parsed.place };
    if (parsed.dateFrom || parsed.dateTo) {
      where.date = {};
      if (parsed.dateFrom) where.date[Op.gte] = parsed.dateFrom;
      if (parsed.dateTo) where.date[Op.lte] = parsed.dateTo;
    }

    const order: any = [
      [parsed.sortBy || 'createdAt', parsed.sortDir || 'desc'],
    ];

    const RecordModel = await getRecordModel();

    const [data, total] = await Promise.all([
      RecordModel.findAll({ where, limit, offset, order }),
      RecordModel.count({ where }),
    ]);

    // some stats for current filter
    const totalWeight = await RecordModel.sum('weightGrams', { where });
    const totalAmount = await RecordModel.sum('amount', { where });
    const goldCount = await RecordModel.count({
      where: { ...where, itemType: 'Gold' },
    });
    const silverCount = await RecordModel.count({
      where: { ...where, itemType: 'Silver' },
    });

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      stats: {
        totalWeight: Number(totalWeight || 0),
        totalAmount: Number(totalAmount || 0),
        goldCount,
        silverCount,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const RecordModel = await getRecordModel();
    const body = await req.json();
    const parsed = recordCreateSchema.parse(body);

    // Check if slNo already exists
    const existingRecord = await RecordModel.findOne({
      where: { slNo: parsed.slNo },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error: 'validation',
          issues: [{ path: ['slNo'], message: 'Serial number already exists' }],
        },
        { status: 400 }
      );
    }

    // Calculate interest based on amount (only if amount is provided)
    const interest = parsed.amount && parsed.amount >= 10000 ? 2.5 : 3; // 2.5% or 3%

    const created = await RecordModel.create({
      date: parsed.date || new Date(),
      interest,
      ...parsed,
    } as any);

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Create record error', err);
    if (err?.issues)
      return NextResponse.json(
        { error: 'validation', issues: err.issues },
        { status: 400 }
      );
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
});
