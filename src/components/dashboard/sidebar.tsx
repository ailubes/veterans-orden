'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  Vote,
  CheckSquare,
  Settings,
  LogOut,
  Trophy,
  Shield,
  Bell,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useEffect, useState } from 'react';
import { NotificationBell } from './notification-bell';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'ОГЛЯД' },
  { href: '/dashboard/referrals', icon: Users, label: 'ЗАПРОШЕННЯ' },
  { href: '/dashboard/events', icon: Calendar, label: 'ПОДІЇ' },
  { href: '/dashboard/votes', icon: Vote, label: 'ГОЛОСУВАННЯ' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'ЗАВДАННЯ' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'РЕЙТИНГ' },
  { href: '/dashboard/settings', icon: Settings, label: 'НАЛАШТУВАННЯ' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('clerk_id', user.id)
          .single();

        const adminRoles = ['admin', 'super_admin', 'regional_leader'];
        setIsAdmin(Boolean(profile && adminRoles.includes(profile.role)));
      }
    };

    checkAdminStatus();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-timber-dark text-canvas min-h-screen">
      {/* Logo & Notifications */}
      <div className="p-6 border-b border-canvas/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={40} className="text-canvas" />
          <span className="font-syne font-bold text-lg tracking-tight">МЕРЕЖА</span>
        </Link>
        <NotificationBell variant="dark" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider transition-colors ${
                    isActive
                      ? 'bg-accent text-canvas'
                      : 'hover:bg-canvas/10'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Admin Link - only visible to admins */}
          {isAdmin && (
            <>
              <li className="pt-4 mt-4 border-t border-canvas/10">
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'bg-accent text-canvas'
                      : 'hover:bg-canvas/10'
                  }`}
                >
                  <Shield size={18} />
                  АДМІН-ПАНЕЛЬ
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-canvas/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider hover:bg-canvas/10 w-full transition-colors"
        >
          <LogOut size={18} />
          ВИЙТИ
        </button>
      </div>
    </aside>
  );
}
