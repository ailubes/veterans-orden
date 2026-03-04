'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Shield,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMessenger } from '@/components/messaging/messenger-provider';
import { dashboardNavGroups, isDashboardItemActive } from './navigation-config';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
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

  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    for (const group of dashboardNavGroups) {
      if (group.collapsible) {
        defaults[group.id] = !!group.defaultCollapsed;
      }
    }
    // On shorter laptop screens collapse the busiest group by default.
    if (typeof window !== 'undefined' && window.innerHeight < 900) {
      defaults.engagement = true;
    }
    setCollapsedGroups(defaults);
  }, []);

  useEffect(() => {
    const applyResponsiveCollapse = () => {
      const engagementGroup = dashboardNavGroups.find((group) => group.id === 'engagement');
      if (!engagementGroup) return;

      const engagementActive = engagementGroup.items.some((item) =>
        isDashboardItemActive(pathname, item)
      );

      if (window.innerHeight < 900 && !engagementActive) {
        setCollapsedGroups((prev) => ({
          ...prev,
          engagement: true,
        }));
      }
    };

    applyResponsiveCollapse();
    window.addEventListener('resize', applyResponsiveCollapse);
    return () => window.removeEventListener('resize', applyResponsiveCollapse);
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-panel-900 text-text-100 min-h-screen border-r border-line">
      {/* Logo */}
      <div className="p-6 border-b border-line">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-veterans-orden.png"
            alt="Орден Ветеранів"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <span className="font-syne font-bold text-lg tracking-tight">ОРДЕН</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
        <div className="space-y-4">
          {dashboardNavGroups.map((group) => (
            <div key={group.id}>
              {(() => {
                const hasActiveItem = group.items.some((item) => isDashboardItemActive(pathname, item));
                const isCollapsed = !!(group.collapsible && collapsedGroups[group.id] && !hasActiveItem);
                return (
                  <>
              {group.collapsible ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full px-3 mb-1 text-[10px] font-bold tracking-[0.18em] text-muted-500/90 flex items-center justify-between hover:text-text-100 transition-colors"
                >
                  <span>{group.title}</span>
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </button>
              ) : (
                <p className="px-3 mb-1 text-[10px] font-bold tracking-[0.18em] text-muted-500/90">
                  {group.title}
                </p>
              )}
              <ul className={`space-y-1 ${isCollapsed ? 'hidden' : ''}`}>
                {group.items.map((item) => {
                  const isActive = isDashboardItemActive(pathname, item);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 rounded transition-colors ${
                          item.secondary ? 'py-2 text-[11px]' : 'py-2.5 text-xs font-bold tracking-wider'
                        } ${
                          isActive
                            ? 'bg-bronze text-bg-950'
                            : 'hover:bg-panel-850'
                        }`}
                      >
                        <Icon size={item.secondary ? 16 : 18} />
                        {item.label}
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

          <div>
            <p className="px-3 mb-1 text-[10px] font-bold tracking-[0.18em] text-muted-500/90">
              ЗВ'ЯЗОК
            </p>
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
          </div>

          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-line">
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
            </div>
          )}
        </div>
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
