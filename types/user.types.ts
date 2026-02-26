export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'pro';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  passwordHash?: string;
  role: UserRole;
  avatar: string | null;
  plan: UserPlan;
  designCount: number;
  storageUsed: number;
  lastLogin: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicProfile {
  _id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar: string | null;
  plan: UserPlan;
  designCount: number;
  createdAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  username: string;
}

export interface AuthResponse {
  user: UserPublicProfile;
  accessToken: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
