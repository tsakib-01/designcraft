import { connectDB } from '@/lib/db/mongoose';
import Design from '@/lib/db/models/Design';
import User from '@/lib/db/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { updateDesignSchema } from '@/lib/validations/design.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

type Context = { params: Promise<Record<string, string>> };

async function getDesign(req: AuthenticatedRequest, ctx?: Context) {
  await connectDB();
  const { id } = await ctx!.params!;
  const design = await Design.findOne({ _id: id, ownerId: req.user.userId });
  if (!design) return apiError('Design not found', 404);
  return apiSuccess(design);
}

async function updateDesign(req: AuthenticatedRequest, ctx?: Context) {
  await connectDB();
  const { id } = await ctx!.params!;
  const body = await req.json();
  const parsed = updateDesignSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);
  const design = await Design.findOneAndUpdate(
    { _id: id, ownerId: req.user.userId },
    { ...parsed.data, $inc: { version: 1 } },
    { new: true }
  );
  if (!design) return apiError('Design not found', 404);
  return apiSuccess(design, 'Design saved');
}

async function deleteDesign(req: AuthenticatedRequest, ctx?: Context) {
  await connectDB();
  const { id } = await ctx!.params!;
  const design = await Design.findOneAndDelete({ _id: id, ownerId: req.user.userId });
  if (!design) return apiError('Design not found', 404);
  await User.findByIdAndUpdate(req.user.userId, { $inc: { designCount: -1 } });
  return apiSuccess(null, 'Design deleted');
}

export const GET    = withAuth(getDesign);
export const PUT    = withAuth(updateDesign);
export const DELETE = withAuth(deleteDesign);