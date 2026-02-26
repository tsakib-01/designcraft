import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api.types';

export function apiSuccess<T>(data: T, message?: string, status = 200): NextResponse {
  const response: ApiResponse<T> = { success: true, data, message };
  return NextResponse.json(response, { status });
}

export function apiError(error: string, status = 400): NextResponse {
  const response: ApiResponse = { success: false, error };
  return NextResponse.json(response, { status });
}

export function apiCreated<T>(data: T, message = 'Created successfully'): NextResponse {
  return apiSuccess(data, message, 201);
}
