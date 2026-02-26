import { connectDB } from '@/lib/db/mongoose';
import Template from '@/lib/db/models/Template';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

async function updateTemplate(req: AuthenticatedRequest, ctx?: { params: Record<string, string> }) {
  await connectDB();
  const body = await req.json();
  const template = await Template.findByIdAndUpdate(ctx?.params?.id, body, { new: true });
  if (!template) return apiError('Template not found', 404);
  return apiSuccess(template, 'Template updated');
}

async function deleteTemplate(_req: AuthenticatedRequest, ctx?: { params: Record<string, string> }) {
  await connectDB();
  const template = await Template.findByIdAndDelete(ctx?.params?.id);
  if (!template) return apiError('Template not found', 404);
  return apiSuccess(null, 'Template deleted');
}

export const PUT    = withAuth(updateTemplate, { roles: ['admin'] });
export const DELETE = withAuth(deleteTemplate, { roles: ['admin'] });
