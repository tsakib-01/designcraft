import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Template from '@/lib/db/models/Template';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const page     = Math.max(1, parseInt(url.searchParams.get('page')     ?? '1'));
    const limit    = Math.min(50, parseInt(url.searchParams.get('limit')    ?? '20'));
    const search   = url.searchParams.get('search')   ?? '';
    const category = url.searchParams.get('category') ?? '';

    const query: Record<string, unknown> = { isActive: true };
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category) query.categoryId = category;

    const [items, total] = await Promise.all([
      Template.find(query)
        .select('-canvasData')
        .sort({ usageCount: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Template.countDocuments(query),
    ]);

    return apiSuccess({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[TEMPLATES]', err);
    return apiError('Internal server error', 500);
  }
}
