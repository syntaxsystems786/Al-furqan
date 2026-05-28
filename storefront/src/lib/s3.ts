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

import fs from 'fs';
import path from 'path';

export async function uploadImageToR2(fileBuffer: Buffer): Promise<string> {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;

  // Compress and convert to webp
  const processedBuffer = await sharp(fileBuffer)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const isR2Configured = process.env.CLOUDFLARE_ACCOUNT_ID && 
                         process.env.CLOUDFLARE_ACCOUNT_ID !== "your_cloudflare_account_id" &&
                         process.env.R2_ACCESS_KEY_ID &&
                         process.env.R2_ACCESS_KEY_ID !== "your_r2_access_key_id";

  if (isR2Configured) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: processedBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable'
    });

    await s3Client.send(command);
    return `${PUBLIC_URL}/${filename}`;
  } else {
    // Local fallback
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, processedBuffer);
    return `/uploads/${filename}`;
  }
}
