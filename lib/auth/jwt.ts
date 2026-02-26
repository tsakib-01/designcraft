import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '@/types/user.types';

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const signAccessToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });

export const signRefreshToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as AuthTokenPayload;
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as AuthTokenPayload;
};
