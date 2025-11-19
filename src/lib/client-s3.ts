export async function uploadToS3(
  file: File,
  folder = 'uploads'
): Promise<string> {
  const MAX = Number(process.env.NEXT_PUBLIC_S3_MAX_FILE_SIZE || '10485760');
  const ALLOWED = (process.env.NEXT_PUBLIC_S3_ALLOWED_TYPES || '').split(',');
  if (file.size > MAX) throw new Error('File exceeds maximum size');
  if (ALLOWED.length && !ALLOWED.includes(file.type))
    throw new Error('File type not allowed');

  // Request presign
  const resp = await fetch('/api/s3/presign', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-file-size': String(file.size),
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      folder,
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to get presign URL');
  }
  const { uploadUrl, publicUrl } = await resp.json();

  // Upload via PUT
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) throw new Error('Upload failed');

  return publicUrl;
}
