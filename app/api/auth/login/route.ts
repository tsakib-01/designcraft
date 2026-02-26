import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/validations/auth.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422);
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return apiError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return apiError('Invalid credentials', 401);
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const payload = { userId: user._id.toString(), email: user.email, role: user.role, username: user.username };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const cookieStore = await cookies();
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return apiSuccess({
      user: { _id: user._id, email: user.email, username: user.username, role: user.role, avatar: user.avatar, plan: user.plan, designCount: user.designCount, createdAt: user.createdAt },
      accessToken,
    }, 'Login successful');
  } catch (err) {
    console.error('[LOGIN]', err);
    return apiError('Internal server error', 500);
  }
}
