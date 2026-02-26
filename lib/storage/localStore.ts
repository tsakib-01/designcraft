import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function ensureUploadDir(subDir = ''): Promise<string> {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  subDir = 'images'
): Promise<{ url: string; fileName: string; sizeBytes: number }> {
  await ensureUploadDir(subDir);

  const ext = path.extname(originalName).toLowerCase();
  const fileName = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, subDir, fileName);

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${subDir}/${fileName}`,
    fileName,
    sizeBytes: buffer.length,
  };
}

export function getPublicUrl(relativePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${baseUrl}${relativePath}`;
}

export function isAllowedMimeType(mimeType: string): boolean {
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'image/svg+xml', 'video/mp4', 'font/ttf', 'font/otf', 'font/woff', 'font/woff2',
  ];
  return allowed.includes(mimeType);
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
