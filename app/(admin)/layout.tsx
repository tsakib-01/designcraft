'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, BarChart2, Layers, Image as ImageIcon, Users, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils/helpers';

const adminNav = [
  { href: '/admin/dashboard', label: 'Analytics',  icon: BarChart2  },
  { href: '/admin/templates', label: 'Templates',  icon: Layers     },
  { href: '/admin/assets',    label: 'Assets',     icon: ImageIcon  },
  { href: '/admin/users',     label: 'Users',      icon: Users      },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'admin') { router.replace('/dashboard'); }
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-surface-0">
      <aside className="w-60 flex-shrink-0 bg-surface-100 border-r border-surface-300 flex flex-col">
        <div className="px-5 py-5 border-b border-surface-300">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-display font-bold text-amber-400">Admin Panel</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">DesignCraft Control Center</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                pathname === href
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-300">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-surface-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
