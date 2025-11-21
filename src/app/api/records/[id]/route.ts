import { NextResponse } from 'next/server';
import { getRecordModel } from '@/lib/models/record';
import { recordUpdateSchema } from '@/lib/validators/record';
import { Op } from 'sequelize';
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(
  async (req: Request, user, params: { id: string }) => {
    try {
      const RecordModel = await getRecordModel();
      const id = Number(params.id);
      const record = await RecordModel.findByPk(id);
      if (!record)
        return NextResponse.json({ error: 'Not found' }, { status: 400 });

      // Calculate additional fields
      const recordData = record.toJSON();
      const entryDate = new Date(recordData.date || new Date());
      const today = new Date();
      const daysOld = Math.floor(
        (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const monthsOld = Math.floor(daysOld / 30);

      // Calculate amount to be paid only if >= 30 days old
      let amountToBePaid = null;
      if (daysOld >= 30) {
        const fullMonths = Math.floor(daysOld / 30);
        const remainingDays = daysOld % 30;
        // If remaining days >= 5, consider it as an additional month
        const months = remainingDays >= 5 ? fullMonths + 1 : fullMonths;
        const interestMonths = months <= 1 ? 1 : months - 1;
        const calculatedInterestAmount =
          recordData.amount && recordData.interest
            ? ((recordData.amount * recordData.interest) / 100) * interestMonths
            : 0;
        amountToBePaid = recordData.amount
          ? recordData.amount + calculatedInterestAmount
          : calculatedInterestAmount;
      }

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

      const response = {
        ...recordData,
        daysOld,
        monthsOld,
        amountToBePaid,
        calculatedInterestAmount,
        calculatedTotalAmount,
        interestMonths,
      };

      return NextResponse.json(response);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'server error' }, { status: 500 });
    }
  }
);

export const PUT = withAuth(
  async (req: Request, user, params: { id: string }) => {
    try {
      const RecordModel = await getRecordModel();
      const id = Number(params.id);
      const body = await req.json();
      const parsed = recordUpdateSchema.parse(body);
      const record = await RecordModel.findByPk(id);
      if (!record)
        return NextResponse.json({ error: 'Not found' }, { status: 404 });

      // Check if slNo already exists (excluding current record)
      if (parsed.slNo) {
        const existingRecord = await RecordModel.findOne({
          where: { slNo: parsed.slNo, id: { [Op.ne]: id } },
        });

        if (existingRecord) {
          return NextResponse.json(
            {
              error: 'validation',
              issues: [
                { path: ['slNo'], message: 'Serial number already exists' },
              ],
            },
            { status: 400 }
          );
        }
      }

      await record.update(parsed as any);
      return NextResponse.json(record);
    } catch (err: any) {
      console.error(err);
      if (err?.issues)
        return NextResponse.json(
          { error: 'validation', issues: err.issues },
          { status: 400 }
        );
      return NextResponse.json({ error: 'server error' }, { status: 500 });
    }
  }
);

export const DELETE = withAuth(
  async (req: Request, user, params: { id: string }) => {
    try {
      const RecordModel = await getRecordModel();
      const id = Number(params.id);
      const record = await RecordModel.findByPk(id);
      if (!record) return new NextResponse(null, { status: 204 });
      await record.destroy();
      return new NextResponse(null, { status: 204 });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'server error' }, { status: 500 });
    }
  }
);
