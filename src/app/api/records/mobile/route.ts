import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRecordModel } from '@/lib/models/record';
import { withAuth } from '@/lib/auth-middleware';
import { Op } from 'sequelize';

const querySchema = z.object({
  mobile: z.string().min(3).max(10),
});

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const url = new URL(req.url);
    const qs = Object.fromEntries(url.searchParams.entries());
    const parsed = querySchema.parse(qs);

    const RecordModel = await getRecordModel();

    // Find up to 10 most recent records with matching mobile number
    const records = await RecordModel.findAll({
      where: {
        mobile: {
          [Op.iLike]: `%${parsed.mobile}%`, // Case-insensitive partial match
        },
      },
      order: [
        ['updatedAt', 'DESC'], // Most recently updated first
        ['createdAt', 'DESC'], // Then most recently created
      ],
      limit: 10, // Return up to 10 suggestions
    });

    return NextResponse.json({
      data: records,
    });
  } catch (err: any) {
    console.error('Mobile search error:', err);
    if (err?.issues) {
      return NextResponse.json(
        { error: 'validation', issues: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
});
