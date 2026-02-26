import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

async function listUsers(req: AuthenticatedRequest) {
  await connectDB();
  const url = new URL(req.url);
  const page   = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1'));
  const limit  = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20'));
  const search = url.searchParams.get('search') ?? '';

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { email:    { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return apiSuccess({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
}

async function updateUser(req: AuthenticatedRequest, ctx?: { params: Promise<Record<string, string>> }) {
  await connectDB();
  const body = await req.json();
  const { role, isActive, plan } = body;
  const { id } = await (ctx?.params ?? Promise.resolve({ id: '' }));

  const user = await User.findByIdAndUpdate(
    id,
    { ...(role !== undefined && { role }), ...(isActive !== undefined && { isActive }), ...(plan !== undefined && { plan }) },
    { new: true, select: '-passwordHash' }
  );

  if (!user) return apiError('User not found', 404);
  return apiSuccess(user, 'User updated');
}

export const GET = withAuth(listUsers, { roles: ['admin'] });
export const PUT = withAuth(updateUser, { roles: ['admin'] });