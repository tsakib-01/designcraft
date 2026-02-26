'use client';
import { useState } from 'react';
import { User, Mail, Shield, BarChart2, HardDrive } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { formatBytes } from '@/lib/utils/helpers';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-white mb-8">Profile</h1>

      {/* User card */}
      <div className="bg-surface-100 rounded-2xl border border-surface-400 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-2xl font-bold font-display">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-brand-600/20 text-brand-400 border border-brand-500/20 rounded-full px-2.5 py-0.5 font-medium capitalize">
              <Shield className="w-3 h-3" />
              {user.role} · {user.plan} plan
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-100 rounded-xl border border-surface-400 p-5">
          <div className="flex items-center gap-3 mb-1">
            <BarChart2 className="w-5 h-5 text-brand-400" />
            <span className="text-gray-400 text-sm">Total Designs</span>
          </div>
          <p className="text-3xl font-bold text-white">{user.designCount}</p>
        </div>
        <div className="bg-surface-100 rounded-xl border border-surface-400 p-5">
          <div className="flex items-center gap-3 mb-1">
            <HardDrive className="w-5 h-5 text-accent-cyan" />
            <span className="text-gray-400 text-sm">Storage Used</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatBytes(user.storageUsed ?? 0)}</p>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-surface-100 rounded-2xl border border-surface-400 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account Information</h3>
        <dl className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <dt className="text-gray-500 w-24">Username</dt>
            <dd className="text-white">{user.username}</dd>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-500" />
            <dt className="text-gray-500 w-24">Email</dt>
            <dd className="text-white">{user.email}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
