import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { signAccessToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return apiError('No refresh token', 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    await connectDB();

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return apiError('User not found or inactive', 401);
    }

    const newPayload = { userId: user._id.toString(), email: user.email, role: user.role, username: user.username };
    const accessToken = signAccessToken(newPayload);

    return apiSuccess({ accessToken }, 'Token refreshed');
  } catch {
    return apiError('Invalid refresh token', 401);
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('refreshToken');
  return apiSuccess(null, 'Logged out successfully');
}
