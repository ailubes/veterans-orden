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
  ShoppingBag,
  ShoppingCart,
  Coins,
  HelpCircle,
  Target,
  MessageCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useEffect, useState } from 'react';
import { useMessenger } from '@/components/messaging/messenger-provider';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'ОГЛЯД' },
  { href: '/dashboard/referrals', icon: Users, label: 'ЗАПРОШЕННЯ' },
  { href: '/dashboard/challenges', icon: Target, label: 'ВИКЛИКИ' },
  { href: '/dashboard/events', icon: Calendar, label: 'ПОДІЇ' },
  { href: '/dashboard/votes', icon: Vote, label: 'ГОЛОСУВАННЯ' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'ЗАВДАННЯ' },
  { href: '/dashboard/marketplace', icon: ShoppingBag, label: 'МАГАЗИН' },
  { href: '/dashboard/marketplace/checkout', icon: ShoppingCart, label: 'КОШИК' },
  { href: '/dashboard/points', icon: Coins, label: 'МОЇ БАЛИ' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'РЕЙТИНГ' },
  { href: '/help', icon: HelpCircle, label: 'ДОПОМОГА' },
  { href: '/dashboard/notifications', icon: Bell, label: 'ПОВІДОМЛЕННЯ' },
  { href: '/dashboard/settings', icon: Settings, label: 'НАЛАШТУВАННЯ' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const { totalUnread, toggleMessenger } = useMessenger();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('staff_role, membership_role')
          .eq('auth_id', user.id)
          .single();

        if (profile) {
          // Check if user has admin access through either staff role or membership role
          const staffRole = profile.staff_role || 'none';
          const membershipRole = profile.membership_role || 'supporter';
          const isStaffAdmin = staffRole === 'admin' || staffRole === 'super_admin';
          const isLeaderByMembership = ['regional_leader', 'national_leader', 'network_guide'].includes(membershipRole);
          setIsAdmin(isStaffAdmin || isLeaderByMembership);
        }
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
    <aside className="hidden lg:flex flex-col w-64 bg-panel-900 text-text-100 min-h-screen border-r border-line">
      {/* Logo */}
      <div className="p-6 border-b border-line">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={40} className="text-bronze" />
          <span className="font-syne font-bold text-lg tracking-tight">МЕРЕЖА</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider transition-colors rounded ${
                    isActive
                      ? 'bg-bronze text-bg-950'
                      : 'hover:bg-panel-850'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Messaging Button */}
          <li>
            <button
              onClick={toggleMessenger}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider transition-colors hover:bg-panel-850 rounded w-full relative"
            >
              <MessageCircle size={18} />
              ЧАТИ
              {totalUnread > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-bronze text-bg-950 text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>
          </li>

          {/* Admin Link - only visible to admins */}
          {isAdmin && (
            <li className="pt-4 mt-4 border-t border-line">
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider transition-colors rounded ${
                  pathname.startsWith('/admin')
                    ? 'bg-bronze text-bg-950'
                    : 'hover:bg-panel-850'
                }`}
              >
                <Shield size={18} />
                АДМІН-ПАНЕЛЬ
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-line">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-wider hover:bg-panel-850 rounded w-full transition-colors"
        >
          <LogOut size={18} />
          ВИЙТИ
        </button>
      </div>
    </aside>
  );
}
