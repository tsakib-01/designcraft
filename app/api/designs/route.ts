import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Design from '@/lib/db/models/Design';
import User from '@/lib/db/models/User';
import Template from '@/lib/db/models/Template';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createDesignSchema } from '@/lib/validations/design.schema';
import { apiSuccess, apiError, apiCreated } from '@/lib/utils/apiResponse';

async function getDesigns(req: AuthenticatedRequest) {
  await connectDB();
  const url = new URL(req.url);
  const page  = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1'));
  const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20'));
  const search = url.searchParams.get('search') ?? '';

  const query: Record<string, unknown> = { ownerId: req.user.userId };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags:  { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const [items, total] = await Promise.all([
    Design.find(query)
      .select('-canvasData')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Design.countDocuments(query),
  ]);

  return apiSuccess({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
}

async function createDesign(req: AuthenticatedRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = createDesignSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.errors[0].message, 422);
  }

  const { title, dimensions, templateId, canvasData } = parsed.data;
  let initialCanvasData = canvasData ?? null;

  // If creating from template, copy canvas data
  if (templateId) {
    const template = await Template.findById(templateId);
    if (template) {
      initialCanvasData = template.canvasData;
      await Template.findByIdAndUpdate(templateId, { $inc: { usageCount: 1 } });
    }
  }

  const design = await Design.create({
    ownerId: req.user.userId,
    title,
    dimensions: dimensions ?? { width: 1080, height: 1080 },
    canvasData: initialCanvasData,
    templateId: templateId ?? null,
  });

  await User.findByIdAndUpdate(req.user.userId, { $inc: { designCount: 1 } });

  return apiCreated(design, 'Design created');
}

export const GET  = withAuth(getDesigns);
export const POST = withAuth(createDesign);
