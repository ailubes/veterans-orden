'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Grip,
  MessagesSquare,
  ChevronDown,
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
  User,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from './notification-bell';
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

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
}

export function DashboardHeader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totalUnread, toggleMessenger } = useMessenger();

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('first_name, last_name, email, avatar_url, role')
          .eq('clerk_id', user.id)
          .single();

        if (data) {
          setProfile(data);
          const adminRoles = ['admin', 'super_admin', 'regional_leader'];
          setIsAdmin(adminRoles.includes(data.role));
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const getInitials = () => {
    if (!profile) return '?';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <header className="flex items-center justify-end gap-1 sm:gap-2 px-4 lg:px-8 py-3 lg:py-4 border-b border-timber-dark/10">
      {/* Extended Menu (Grip) */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 rounded-lg transition-colors text-timber-beam hover:bg-timber-dark/5 hover:text-timber-dark"
            aria-label="Меню"
          >
            <Grip className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 sm:w-72 max-h-[80vh] overflow-y-auto p-0 bg-canvas border-2 border-timber-dark"
          sideOffset={8}
        >
          <DropdownMenuLabel className="px-4 py-3 border-b border-timber-dark/10">
            <span className="font-syne font-bold text-sm">МЕНЮ</span>
          </DropdownMenuLabel>

          <div className="py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-timber-dark/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>

          {/* Admin Link */}
          {isAdmin && (
            <>
              <DropdownMenuSeparator className="bg-timber-dark/10" />
              <div className="py-2">
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${
                      pathname.startsWith('/admin')
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-timber-dark/5'
                    }`}
                  >
                    <Shield size={18} />
                    <span className="text-sm font-medium">АДМІН-ПАНЕЛЬ</span>
                  </Link>
                </DropdownMenuItem>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Messenger */}
      <button
        onClick={toggleMessenger}
        className="relative p-2 rounded-lg transition-colors text-timber-beam hover:bg-timber-dark/5 hover:text-timber-dark"
        aria-label="Повідомлення"
      >
        <MessagesSquare className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-orange-500 rounded-full px-1">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Notifications */}
      <NotificationBell variant="light" />

      {/* User Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1.5 p-1.5 rounded-lg transition-colors hover:bg-timber-dark/5"
            aria-label="Профіль"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-timber-dark text-canvas flex items-center justify-center text-sm font-bold overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Аватар"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-timber-beam" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 p-0 bg-canvas border-2 border-timber-dark"
          sideOffset={8}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-timber-dark/10">
            <p className="font-syne font-bold text-sm truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-timber-beam truncate">
              {profile?.email}
            </p>
          </div>

          <div className="py-2">
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-timber-dark/5"
              >
                <User size={16} />
                <span className="text-sm">Мій профіль</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-timber-dark/5"
              >
                <Settings size={16} />
                <span className="text-sm">Налаштування</span>
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="bg-timber-dark/10" />

          <div className="py-2">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              <span className="text-sm">Вийти</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
