import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Asset } from '@/lib/db/models/Asset';
import User from '@/lib/db/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { saveFile, isAllowedMimeType, MAX_FILE_SIZE } from '@/lib/storage/localStore';
import { apiCreated, apiError } from '@/lib/utils/apiResponse';

async function uploadAsset(req: AuthenticatedRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string) ?? file?.name ?? 'Untitled';
    const type = (formData.get('type') as string) ?? 'image';

    if (!file) return apiError('No file provided', 400);
    if (file.size > MAX_FILE_SIZE) return apiError('File size exceeds 10MB limit', 400);
    if (!isAllowedMimeType(file.type)) return apiError('File type not allowed', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, sizeBytes } = await saveFile(buffer, file.name, type === 'icon' ? 'icons' : 'images');

    const asset = await Asset.create({
      uploadedBy: req.user.userId,
      type,
      name,
      url,
      mimeType:  file.type,
      sizeBytes,
      isPublic:  false,
    });

    await User.findByIdAndUpdate(req.user.userId, { $inc: { storageUsed: sizeBytes } });

    return apiCreated(asset, 'Asset uploaded');
  } catch (err) {
    console.error('[UPLOAD]', err);
    return apiError('Upload failed', 500);
  }
}

export const POST = withAuth(uploadAsset);
