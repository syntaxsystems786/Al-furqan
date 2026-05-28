import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'alfurqan';
export const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export async function uploadImageToR2(fileBuffer: Buffer): Promise<string> {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;

  // Compress and convert to webp
  const processedBuffer = await sharp(fileBuffer)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: processedBuffer,
    ContentType: 'image/webp',
    // R2 supports CacheControl
    CacheControl: 'public, max-age=31536000, immutable'
  });

  await s3Client.send(command);

  // Return the public URL
  return `${PUBLIC_URL}/${filename}`;
}
