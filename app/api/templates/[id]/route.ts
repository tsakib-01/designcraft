import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Template from '@/lib/db/models/Template';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const template = await Template.findOne({ _id: id, isActive: true });
    if (!template) return apiError('Template not found', 404);
    return apiSuccess(template);
  } catch {
    return apiError('Internal server error', 500);
  }
}