import { connectDB } from '@/lib/db/mongoose';
import { Asset } from '@/lib/db/models/Asset';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

async function deleteAsset(req: AuthenticatedRequest, ctx?: { params: Promise<Record<string, string>> }) {
  await connectDB();
  const { id } = await (ctx?.params ?? Promise.resolve({ id: '' }));

  const query = req.user.role === 'admin'
    ? { _id: id }
    : { _id: id, uploadedBy: req.user.userId };

  const asset = await Asset.findOneAndDelete(query);
  if (!asset) return apiError('Asset not found', 404);
  return apiSuccess(null, 'Asset deleted');
}

export const DELETE = withAuth(deleteAsset);