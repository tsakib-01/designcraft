import { connectDB } from '@/lib/db/mongoose';
import Template from '@/lib/db/models/Template';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

async function updateTemplate(req: AuthenticatedRequest, ctx?: { params: Promise<Record<string, string>> }) {
  await connectDB();
  const body = await req.json();
  const { id } = await (ctx?.params ?? Promise.resolve({ id: '' }));

  // Only allow safe fields to be updated
  const { title, description, thumbnail, canvasData, categoryId, tags, dimensions, isPremium, isActive } = body;

  const updateData = Object.fromEntries(
    Object.entries({ title, description, thumbnail, canvasData, categoryId, tags, dimensions, isPremium, isActive })
      .filter(([, v]) => v !== undefined)
  );

  const template = await Template.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  if (!template) return apiError('Template not found', 404);
  return apiSuccess(template, 'Template updated');
}

async function deleteTemplate(_req: AuthenticatedRequest, ctx?: { params: Promise<Record<string, string>> }) {
  await connectDB();
  const { id } = await (ctx?.params ?? Promise.resolve({ id: '' }));
  const template = await Template.findByIdAndDelete(id);
  if (!template) return apiError('Template not found', 404);
  return apiSuccess(null, 'Template deleted');
}

export const PUT    = withAuth(updateTemplate, { roles: ['admin'] });
export const DELETE = withAuth(deleteTemplate, { roles: ['admin'] });