'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Grip,
  MessagesSquare,
  ChevronDown,
  X,
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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';
import { NotificationBell } from './notification-bell';
import { useMessenger } from '@/components/messaging/messenger-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
  staff_role: string | null;
  membership_role: string | null;
}

export function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
          .select('first_name, last_name, email, avatar_url, staff_role, membership_role')
          .eq('clerk_id', user.id)
          .single();

        if (data) {
          setProfile(data);
          // Check if user has admin access through either staff role or membership role
          const staffRole = data.staff_role || 'none';
          const membershipRole = data.membership_role || 'supporter';
          const isStaffAdmin = staffRole === 'admin' || staffRole === 'super_admin';
          const isLeaderByMembership = ['regional_leader', 'national_leader', 'network_guide'].includes(membershipRole);
          setIsAdmin(isStaffAdmin || isLeaderByMembership);
        }
      }
    };

    fetchProfile();
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

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
    <div className="lg:hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-3 bg-timber-dark text-canvas">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} className="text-canvas" />
          <span className="font-syne font-bold text-sm tracking-tight">МЕРЕЖА</span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-0.5">
          {/* Grip Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg transition-colors hover:bg-canvas/10"
            aria-label="Меню"
          >
            {isMenuOpen ? <X size={20} /> : <Grip size={20} />}
          </button>

          {/* Messenger */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              toggleMessenger();
            }}
            className="relative p-2 rounded-lg transition-colors hover:bg-canvas/10"
            aria-label="Повідомлення"
          >
            <MessagesSquare size={20} />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold text-white bg-orange-500 rounded-full px-0.5">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>

          {/* Notifications */}
          <NotificationBell variant="dark" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 p-1 rounded-lg transition-colors hover:bg-canvas/10"
                aria-label="Профіль"
              >
                <div className="w-7 h-7 rounded-full bg-canvas text-timber-dark flex items-center justify-center text-xs font-bold overflow-hidden">
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
                <ChevronDown size={14} className="text-canvas/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 p-0 bg-canvas border-2 border-timber-dark"
              sideOffset={8}
            >
              {/* User Info */}
              <div className="px-3 py-2.5 border-b border-timber-dark/10">
                <p className="font-syne font-bold text-sm truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-timber-beam truncate">
                  {profile?.email}
                </p>
              </div>

              <div className="py-1">
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-timber-dark/5"
                  >
                    <User size={15} />
                    <span className="text-sm">Мій профіль</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-timber-dark/5"
                  >
                    <Settings size={15} />
                    <span className="text-sm">Налаштування</span>
                  </Link>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-timber-dark/10" />

              <div className="py-1">
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  <span className="text-sm">Вийти</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      {isMenuOpen && (
        <nav className="fixed inset-0 top-[52px] bg-timber-dark text-canvas z-50 overflow-y-auto">
          <div className="min-h-full pb-20">
            {/* Navigation Items */}
            <ul className="py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-5 py-3 text-sm font-medium tracking-wide transition-colors ${
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
            </ul>

            {/* Admin Link - only visible to admins */}
            {isAdmin && (
              <div className="border-t border-canvas/10 py-2">
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium tracking-wide transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'bg-accent text-canvas'
                      : 'hover:bg-canvas/10'
                  }`}
                >
                  <Shield size={18} />
                  АДМІН-ПАНЕЛЬ
                </Link>
              </div>
            )}

            {/* Sign Out */}
            <div className="border-t border-canvas/10 py-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium tracking-wide hover:bg-canvas/10 w-full transition-colors"
              >
                <LogOut size={18} />
                ВИЙТИ
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
