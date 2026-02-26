import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { registerSchema } from '@/lib/validations/auth.schema';
import { apiSuccess, apiError, apiCreated } from '@/lib/utils/apiResponse';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422);
    }

    const { email, username, password } = parsed.data;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return apiError(
        existing.email === email ? 'Email already registered' : 'Username already taken',
        409
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, username, passwordHash });

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

    return apiCreated({
      user: { _id: user._id, email: user.email, username: user.username, role: user.role, avatar: user.avatar, plan: user.plan, designCount: 0, createdAt: user.createdAt },
      accessToken,
    }, 'Registration successful');
  } catch (err) {
    console.error('[REGISTER]', err);
    return apiError('Internal server error', 500);
  }
}
