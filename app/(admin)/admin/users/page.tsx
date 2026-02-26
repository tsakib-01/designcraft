'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, User as UserIcon, Ban, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { IUser } from '@/types/user.types';
import { formatDate } from '@/lib/utils/helpers';

export default function AdminUsersPage() {
  const { accessToken } = useAuthStore();
  const { addToast }    = useUIStore();
  const [users, setUsers]     = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [total, setTotal]     = useState(0);

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&limit=50`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.success) { setUsers(data.data.items); setTotal(data.data.total); }
    } finally { setLoading(false); }
  }, [accessToken, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUser = async (id: string, updates: Record<string, unknown>) => {
    if (!accessToken) return;
    const res  = await fetch(`/api/admin/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ id, ...updates }),
    });
    // Note: using the users route with body id
    addToast('User updated', 'success');
    fetchUsers();
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Users</h1>
          <p className="text-gray-500 mt-1">{total} registered users</p>
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <Input placeholder="Search by email or username..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
      </div>

      <div className="bg-surface-100 rounded-xl border border-surface-400 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-300">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designs</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-surface-300">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-300 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-surface-300/50 hover:bg-surface-200/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-400 text-gray-400'}`}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 capitalize">{user.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white">{user.designCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {user.isActive ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="xs"
                        variant={user.isActive ? 'danger' : 'secondary'}
                        onClick={() => updateUser(user._id, { isActive: !user.isActive })}
                      >
                        {user.isActive ? 'Ban' : 'Unban'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
