import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPresignedPut } from '@/lib/s3';

const bodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().optional(),
});

const ALLOWED = (process.env.S3_ALLOWED_TYPES || '').split(',');
const MAX_FILE = Number(process.env.S3_MAX_FILE_SIZE || '10485760');

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    const { fileName, contentType, folder } = parsed.data;

    if (!ALLOWED.includes(contentType)) {
      return NextResponse.json(
        { error: 'Content type not allowed' },
        { status: 400 }
      );
    }

    // optional client can send x-file-size header
    const declaredSize = Number(req.headers.get('x-file-size') || '0');
    if (declaredSize > 0 && declaredSize > MAX_FILE) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const presign = await createPresignedPut({ fileName, contentType, folder });

    return NextResponse.json({
      uploadUrl: presign.uploadUrl,
      publicUrl: presign.publicUrl,
      expiresIn: presign.expiresIn,
    });
  } catch (err) {
    console.error('Presign error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
