import { connectDB } from '@/lib/db/mongoose';
import Design from '@/lib/db/models/Design';
import User from '@/lib/db/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiError, apiCreated } from '@/lib/utils/apiResponse';

async function duplicateDesign(req: AuthenticatedRequest, ctx?: { params: Promise<Record<string, string>> }) {
  await connectDB();
  const { id } = await (ctx?.params ?? Promise.resolve({ id: '' }));
  const original = await Design.findOne({ _id: id, ownerId: req.user.userId });
  if (!original) return apiError('Design not found', 404);

  const duplicate = await Design.create({
    ownerId:    req.user.userId,
    title:      `${original.title} (Copy)`,
    thumbnail:  original.thumbnail,
    canvasData: original.canvasData,
    dimensions: original.dimensions,
    category:   original.category,
    tags:       original.tags,
    templateId: original.templateId,
  });

  await User.findByIdAndUpdate(req.user.userId, { $inc: { designCount: 1 } });
  return apiCreated(duplicate, 'Design duplicated');
}

export const POST = withAuth(duplicateDesign);