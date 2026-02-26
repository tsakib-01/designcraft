import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Design from '@/lib/db/models/Design';
import Template from '@/lib/db/models/Template';
import { Asset } from '@/lib/db/models/Asset';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

async function getAnalytics(_req: AuthenticatedRequest) {
  try {
    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, newUsers, activeUsers,
      totalDesigns, totalTemplates, totalAssets,
      topTemplates, recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } }),
      Design.countDocuments(),
      Template.countDocuments({ isActive: true }),
      Asset.countDocuments({ isPublic: true }),
      Template.find().sort({ usageCount: -1 }).limit(5).select('title usageCount thumbnail').lean(),
      User.find().sort({ createdAt: -1 }).limit(10).select('email username createdAt role plan').lean(),
    ]);

    // Designs per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const designsPerDay = await Design.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return apiSuccess({
      users:    { total: totalUsers, new: newUsers, active: activeUsers },
      content:  { designs: totalDesigns, templates: totalTemplates, assets: totalAssets },
      topTemplates,
      recentUsers,
      designsPerDay,
    });
  } catch (err) {
    console.error('[ANALYTICS]', err);
    return apiError('Internal server error', 500);
  }
}

export const GET = withAuth(getAnalytics, { roles: ['admin'] });
