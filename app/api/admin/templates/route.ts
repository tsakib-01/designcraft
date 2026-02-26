import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Template from '@/lib/db/models/Template';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiSuccess, apiError, apiCreated } from '@/lib/utils/apiResponse';

async function listTemplates(req: AuthenticatedRequest) {
  await connectDB();
  const url = new URL(req.url);
  const page  = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1'));
  const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20'));

  const [items, total] = await Promise.all([
    Template.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Template.countDocuments(),
  ]);

  return apiSuccess({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
}

async function createTemplate(req: AuthenticatedRequest) {
  await connectDB();
  const body = await req.json();
  const { title, description, thumbnail, canvasData, categoryId, tags, dimensions, isPremium } = body;

  if (!title || !thumbnail || !canvasData) {
    return apiError('title, thumbnail, and canvasData are required', 422);
  }

  const template = await Template.create({
    title, description, thumbnail, canvasData, categoryId, tags, dimensions,
    isPremium: isPremium ?? false,
    createdBy: req.user.userId,
  });

  return apiCreated(template, 'Template created');
}

export const GET  = withAuth(listTemplates, { roles: ['admin'] });
export const POST = withAuth(createTemplate, { roles: ['admin'] });
