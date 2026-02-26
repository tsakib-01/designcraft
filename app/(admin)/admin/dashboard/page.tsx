'use client';
import { useEffect, useState } from 'react';
import { Users, FileText, Layers, Image, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDate } from '@/lib/utils/helpers';

interface Analytics {
  users:    { total: number; new: number; active: number };
  content:  { designs: number; templates: number; assets: number };
  topTemplates: { _id: string; title: string; usageCount: number }[];
  recentUsers:  { _id: string; email: string; username: string; role: string; createdAt: string }[];
  designsPerDay: { _id: string; count: number }[];
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuthStore();
  const [data, setData]     = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-surface-200 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const stats = [
    { label: 'Total Users',     value: data.users.total,    sub: `${data.users.new} new this month`,    icon: Users,    color: 'text-brand-400'   },
    { label: 'Active Users',    value: data.users.active,   sub: 'Last 30 days',                        icon: TrendingUp, color: 'text-green-400' },
    { label: 'Total Designs',   value: data.content.designs,   sub: 'All user designs',                 icon: FileText, color: 'text-accent-cyan' },
    { label: 'Templates',       value: data.content.templates, sub: `${data.content.assets} assets`,    icon: Layers,   color: 'text-amber-400'   },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">Analytics Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-surface-100 rounded-xl border border-surface-400 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Templates */}
        <div className="bg-surface-100 rounded-xl border border-surface-400 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Top Templates</h3>
          {data.topTemplates.length === 0 ? (
            <p className="text-gray-600 text-sm">No templates yet</p>
          ) : (
            <div className="space-y-3">
              {data.topTemplates.map((t, i) => (
                <div key={t._id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-surface-300 text-xs flex items-center justify-center text-gray-400">{i + 1}</span>
                  <span className="flex-1 text-sm text-white truncate">{t.title}</span>
                  <span className="text-xs text-brand-400 font-medium">{t.usageCount} uses</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-surface-100 rounded-xl border border-surface-400 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Users</h3>
          <div className="space-y-3">
            {data.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.username}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-400 text-gray-400'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
