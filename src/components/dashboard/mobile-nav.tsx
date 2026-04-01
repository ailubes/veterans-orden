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
  Settings,
  LogOut,
  Shield,
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
import { dashboardNavGroups, isDashboardItemActive } from './navigation-config';
import {
  canAccessPaymentsAdmin,
  hasAdminAccess,
  type StaffRole,
} from '@/lib/permissions-utils';
import type { MembershipRole } from '@/lib/constants';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  staff_role: string | null;
  membership_role: string | null;
}

export function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const group of dashboardNavGroups) {
      if (group.collapsible) {
        defaults[group.id] = !!group.defaultCollapsed;
      }
    }
    return defaults;
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminHref, setAdminHref] = useState('/admin');
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
          .select('first_name, last_name, email, avatar_url, role, staff_role, membership_role')
          .eq('auth_id', user.id)
          .single();

        if (data) {
          setProfile(data);
          const staffRole = data.staff_role as StaffRole | null;
          const membershipRole = data.membership_role as MembershipRole | null;
          setIsAdmin(
            hasAdminAccess(staffRole, membershipRole) ||
              canAccessPaymentsAdmin(staffRole) ||
              ['admin', 'super_admin', 'regional_leader'].includes(data.role || '')
          );
          setAdminHref(staffRole === 'payment_manager' ? '/admin/payments' : '/admin');
        }
      }
    };

    fetchProfile();
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    if (!isMenuOpen) return;
    const frame = requestAnimationFrame(() => {
      setIsMenuOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, isMenuOpen]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerHeight >= 900) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setCollapsedGroups((prev) => ({
        ...prev,
        engagement: true,
      }));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

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

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
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

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={adminHref}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-panel-850/5 transition-colors"
                    >
                      <Shield size={18} />
                      <span className="text-sm font-medium">Адмін-панель</span>
                    </Link>
                  </DropdownMenuItem>
                )}
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
            <div className="py-2">
              {dashboardNavGroups.map((group, groupIndex) => (
                <div key={group.id} className={groupIndex > 0 ? 'mt-2 pt-2 border-t border-canvas/10' : ''}>
                  {(() => {
                    const hasActiveItem = group.items.some((item) => isDashboardItemActive(pathname, item));
                    const isCollapsed = !!(group.collapsible && collapsedGroups[group.id] && !hasActiveItem);
                    return (
                      <>
                  {group.collapsible ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full px-6 py-2 text-[10px] font-bold tracking-[0.18em] text-canvas/60 flex items-center justify-between"
                    >
                      <span>{group.title}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                      />
                    </button>
                  ) : (
                    <p className="px-6 py-2 text-[10px] font-bold tracking-[0.18em] text-canvas/60">
                      {group.title}
                    </p>
                  )}
                  <ul className={isCollapsed ? 'hidden' : ''}>
                    {group.items.map((item, index) => {
                      const isActive = isDashboardItemActive(pathname, item);
                      const Icon = item.icon;

                      return (
                        <li
                          key={item.href}
                          style={{ animationDelay: `${(groupIndex * 6 + index) * 25}ms` }}
                          className="animate-in fade-in slide-in-from-left-2 duration-200"
                        >
                          <Link
                            href={item.href}
                            className={`flex items-center gap-4 px-6 ${item.secondary ? 'py-3 text-xs' : 'py-4 text-sm'} tracking-wide transition-all ${
                              isActive
                                ? 'bg-bronze text-canvas shadow-md'
                                : 'hover:bg-panel-900/10 hover:translate-x-1'
                            }`}
                          >
                            <Icon size={item.secondary ? 18 : 20} strokeWidth={2.5} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-panel-900 animate-pulse" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>

            {/* Admin Link - only visible to admins */}
            {isAdmin && (
              <div className="border-t-2 border-canvas/10 py-3 mt-2">
                <Link
                  href={adminHref}
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
