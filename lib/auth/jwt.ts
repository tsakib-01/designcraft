import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '@/types/user.types';

const ACCESS_SECRET  = 'abc8e2fd68a9605e8c50fbc356fe6a8472d4182bb6f79a95b7888424aa00f883eafd0eae2ed05f57b2368460b0a76fabbe8e10c94e33f32e910fdaff700951e6'!;
const REFRESH_SECRET = '71bb5857af9dc8835ddf72abf5316e1e27d54ff29130e44563a41b03d0ed9ab7a351243e4b778bba272da2328448a19a2ee38cf4e672dba3e63d7b4770846ce9';

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
