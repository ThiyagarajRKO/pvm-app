import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteS3Object } from '@/lib/s3';

const bodySchema = z.object({
  key: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    const { key } = parsed.data;

    await deleteS3Object(key);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
