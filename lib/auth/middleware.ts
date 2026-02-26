import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';
import { AuthTokenPayload, UserRole } from '@/types/user.types';
import { apiError } from '@/lib/utils/apiResponse';

export type AuthenticatedRequest = NextRequest & {
  user: AuthTokenPayload;
};

type RouteHandler = (req: AuthenticatedRequest, context?: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;

export function withAuth(
  handler: RouteHandler,
  options: { roles?: UserRole[] } = {}
) {
  return async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return apiError('Unauthorized: No token provided', 401);
    }

    try {
      const payload = verifyAccessToken(token);

      if (options.roles && !options.roles.includes(payload.role)) {
        return apiError('Forbidden: Insufficient permissions', 403);
      }

      (req as AuthenticatedRequest).user = payload;
      return handler(req as AuthenticatedRequest, context);
    } catch {
      return apiError('Unauthorized: Invalid or expired token', 401);
    }
  };
}