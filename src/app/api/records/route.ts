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
  status: z.enum(['active', 'archived', 'big', 'returned']).optional(),
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
        { slNo: { [Op.iLike]: `%${parsed.search}%` } },
      ];
    }
    if (parsed.itemType) where.itemType = parsed.itemType;
    if (parsed.status) {
      if (parsed.status === 'returned') {
        where.isReturned = true;
      } else {
        where.itemCategory = parsed.status;
        // Exclude returned items from active, archived, and big categories
        if (['active', 'archived', 'big'].includes(parsed.status)) {
          where.isReturned = false;
        }
      }
    }
    if (parsed.street && parsed.street.trim() !== '')
      where.street = { [Op.iLike]: parsed.street };
    if (parsed.place && parsed.place.trim() !== '')
      where.place = { [Op.iLike]: parsed.place };
    if (parsed.dateFrom || parsed.dateTo) {
      where.date = {};
      if (parsed.dateFrom) where.date[Op.gte] = parsed.dateFrom;
      if (parsed.dateTo) where.date[Op.lte] = parsed.dateTo;
    }

    const order: any = [[parsed.sortBy || 'date', parsed.sortDir || 'desc']];

    const RecordModel = await getRecordModel();

    const [data, total] = await Promise.all([
      RecordModel.findAll({ where, limit, offset, order }),
      RecordModel.count({ where }),
    ]);

    // Calculate additional fields for each record
    const enhancedData = data.map((record) => {
      const recordData = record.toJSON();
      const entryDate = new Date(recordData.date || new Date());
      const today = new Date();
      const daysOld = Math.floor(
        (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const monthsOld = Math.floor(daysOld / 30);

      // Calculate return interest amounts using the formula
      const fullMonths = Math.floor(daysOld / 30);
      const remainingDays = daysOld % 30;
      // If remaining days >= 5, consider it as an additional month
      const months = remainingDays >= 5 ? fullMonths + 1 : fullMonths;
      const interestMonths = months <= 1 ? 1 : months - 1;
      const calculatedInterestAmount =
        recordData.amount && recordData.interest
          ? ((recordData.amount * recordData.interest) / 100) * interestMonths
          : 0;
      const calculatedTotalAmount = recordData.amount
        ? recordData.amount + calculatedInterestAmount
        : calculatedInterestAmount;

      return {
        ...recordData,
        daysOld,
        monthsOld,
        calculatedInterestAmount,
        calculatedTotalAmount,
        interestMonths,
      };
    });

    // Calculate stats using Sequelize aggregate functions
    const [
      totalWeight,
      totalAmount,
      goldWeight,
      goldAmount,
      silverWeight,
      silverAmount,
      goldCount,
      silverCount,
      bigRecords,
    ] = await Promise.all([
      RecordModel.sum('weightGrams', { where }),
      RecordModel.sum('amount', { where }),
      RecordModel.sum('weightGrams', { where: { ...where, itemType: 'Gold' } }),
      RecordModel.sum('amount', { where: { ...where, itemType: 'Gold' } }),
      RecordModel.sum('weightGrams', {
        where: { ...where, itemType: 'Silver' },
      }),
      RecordModel.sum('amount', { where: { ...where, itemType: 'Silver' } }),
      RecordModel.count({ where: { ...where, itemType: 'Gold' } }),
      RecordModel.count({ where: { ...where, itemType: 'Silver' } }),
      RecordModel.count({ where: { ...where, itemCategory: 'big' } }),
    ]);

    return NextResponse.json({
      data: enhancedData,
      total,
      page,
      limit,
      stats: {
        totalWeight: Number(totalWeight || 0),
        totalAmount: Number(totalAmount || 0),
        goldWeight: Number(goldWeight || 0),
        goldAmount: Number(goldAmount || 0),
        silverWeight: Number(silverWeight || 0),
        silverAmount: Number(silverAmount || 0),
        goldCount,
        silverCount,
        bigRecords,
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

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const RecordModel = await getRecordModel();
    const body = await req.json();
    const { id, returnedAmount } = body;

    if (!id || returnedAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: id and returnedAmount' },
        { status: 400 }
      );
    }

    const record = await RecordModel.findByPk(id);
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Update the record with return information
    record.isReturned = true;
    record.returnedAmount = parseFloat(returnedAmount);
    record.returnedDate = new Date();

    await record.save();

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    console.error('Return item error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
});
