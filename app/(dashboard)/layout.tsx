'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Star, User, LogOut,
  Settings, Shield, ChevronRight, Layers
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/helpers';

const navItems = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/templates',  label: 'Templates',  icon: Star },
  { href: '/profile',    label: 'Profile',    icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-surface-0">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-surface-100 border-r border-surface-300 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-300">
          <span className="text-2xl font-display font-bold gradient-text">DesignCraft</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                pathname === href
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {pathname === href && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}

          {user.role === 'admin' && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Admin</p>
              </div>
              <Link
                href="/admin/dashboard"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  pathname.startsWith('/admin')
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-surface-300'
                )}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-surface-300">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user.plan} plan</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 text-sm mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
