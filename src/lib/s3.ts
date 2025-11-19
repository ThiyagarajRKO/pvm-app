import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.AWS_REGION!;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID!;
const SECRET = process.env.AWS_SECRET_ACCESS_KEY!;
const ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET = process.env.S3_BUCKET_NAME!;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET,
  },
  endpoint: ENDPOINT,
  forcePathStyle: true,
});

export async function createPresignedPut({
  fileName,
  contentType,
  folder = 'uploads',
}: {
  fileName: string;
  contentType: string;
  folder?: string;
}) {
  const key = `${folder}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min
  const publicUrl = `${process.env.S3_PUBLIC_URL}/${folder}/${fileName}`;
  return { uploadUrl, publicUrl, expiresIn: 900 };
}

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3.send(command);
}

export default s3;
