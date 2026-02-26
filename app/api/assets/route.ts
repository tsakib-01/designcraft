import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Asset } from '@/lib/db/models/Asset';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

async function getAssets(req: AuthenticatedRequest) {
  await connectDB();
  const url    = new URL(req.url);
  const type   = url.searchParams.get('type')   ?? '';
  const search = url.searchParams.get('search') ?? '';
  const page   = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1'));
  const limit  = Math.min(100, parseInt(url.searchParams.get('limit') ?? '50'));

  const query: Record<string, unknown> = {
    $or: [{ isPublic: true }, { uploadedBy: req.user.userId }],
  };
  if (type)   query.type   = type;
  if (search) query.name   = { $regex: search, $options: 'i' };

  const [items, total] = await Promise.all([
    Asset.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Asset.countDocuments(query),
  ]);

  return apiSuccess({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export const GET = withAuth(getAssets);
