import { NextResponse } from 'next/server';
import { getRecordModel } from '@/lib/models/record';
import { recordUpdateSchema } from '@/lib/validators/record';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const RecordModel = await getRecordModel();
    const id = Number(params.id);
    const record = await RecordModel.findByPk(id);
    if (!record)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(record);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const RecordModel = await getRecordModel();
    const id = Number(params.id);
    const body = await req.json();
    const parsed = recordUpdateSchema.parse(body);
    const record = await RecordModel.findByPk(id);
    if (!record)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const RecordModel = await getRecordModel();
    const id = Number(params.id);
    const record = await RecordModel.findByPk(id);
    if (!record) return NextResponse.json(null, { status: 204 });
    await record.destroy();
    return NextResponse.json(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
