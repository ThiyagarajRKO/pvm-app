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
      return NextResponse.json(record);
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
