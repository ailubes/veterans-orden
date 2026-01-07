'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
          .eq('auth_id', user.id)
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
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 bg-panel-850 text-canvas shadow-lg border-b border-canvas/10">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/images/logo-veterans-orden.png"
            alt="Орден Ветеранів"
            width={32}
            height={32}
            className="rounded-sm"
          />
          <span className="font-syne font-bold text-base tracking-tight">ОРДЕН</span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-1">
          {/* Grip Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-xl transition-all hover:bg-panel-900/10 active:scale-95"
            aria-label="Меню"
          >
            {isMenuOpen ? (
              <X size={22} className="transition-transform rotate-90" />
            ) : (
              <Grip size={22} />
            )}
          </button>

          {/* Messenger */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              toggleMessenger();
            }}
            className="relative p-2.5 rounded-xl transition-all hover:bg-panel-900/10 active:scale-95"
            aria-label="Повідомлення"
          >
            <MessagesSquare size={22} />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-bg-950 bg-bronze rounded-full px-1 shadow-md">
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
                className="flex items-center gap-1.5 p-1.5 rounded-xl transition-all hover:bg-panel-900/10 active:scale-95"
                aria-label="Профіль"
              >
                <div className="w-8 h-8 rounded-full bg-panel-900 text-text-100 flex items-center justify-center text-sm font-bold overflow-hidden ring-2 ring-canvas/20">
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
                <ChevronDown size={16} className="text-canvas/80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-0 bg-panel-900 border border-line rounded-lg shadow-xl"
              sideOffset={10}
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-line/10 bg-panel-850/5">
                <p className="font-syne font-bold text-sm truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-muted-500 truncate mt-0.5">
                  {profile?.email}
                </p>
              </div>

              <div className="py-2">
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-panel-850/5 transition-colors"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium">Мій профіль</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-panel-850/5 transition-colors"
                  >
                    <Settings size={18} />
                    <span className="text-sm font-medium">Налаштування</span>
                  </Link>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-panel-850/10" />

              <div className="py-2">
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Вийти</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      {isMenuOpen && (
        <nav className="fixed inset-0 top-[60px] bg-panel-850 text-canvas z-50 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="min-h-full pb-20">
            {/* Navigation Items */}
            <ul className="py-3">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li
                    key={item.href}
                    style={{ animationDelay: `${index * 30}ms` }}
                    className="animate-in fade-in slide-in-from-left-2 duration-200"
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-4 px-6 py-4 text-sm font-medium tracking-wide transition-all ${
                        isActive
                          ? 'bg-bronze text-canvas shadow-md'
                          : 'hover:bg-panel-900/10 hover:translate-x-1'
                      }`}
                    >
                      <Icon size={20} strokeWidth={2.5} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-panel-900 animate-pulse" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Admin Link - only visible to admins */}
            {isAdmin && (
              <div className="border-t-2 border-canvas/10 py-3 mt-2">
                <Link
                  href="/admin"
                  className={`flex items-center gap-4 px-6 py-4 text-sm font-medium tracking-wide transition-all ${
                    pathname.startsWith('/admin')
                      ? 'bg-bronze text-canvas shadow-md'
                      : 'hover:bg-panel-900/10 hover:translate-x-1'
                  }`}
                >
                  <Shield size={20} strokeWidth={2.5} />
                  <span className="flex-1">АДМІН-ПАНЕЛЬ</span>
                  {pathname.startsWith('/admin') && (
                    <div className="w-1.5 h-1.5 rounded-full bg-panel-900 animate-pulse" />
                  )}
                </Link>
              </div>
            )}

            {/* Sign Out */}
            <div className="border-t-2 border-canvas/10 py-3 mt-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-4 px-6 py-4 text-sm font-medium tracking-wide hover:bg-red-600/20 hover:translate-x-1 w-full transition-all text-red-400"
              >
                <LogOut size={20} strokeWidth={2.5} />
                <span className="flex-1 text-left">ВИЙТИ</span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
