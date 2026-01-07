'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Vote,
  CheckSquare,
  FileText,
  BarChart3,
  Bell,
  Settings,
  ArrowLeft,
  LogOut,
  ShoppingBag,
  BookOpen,
  Target,
  PanelTop,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'ОГЛЯД' },
  { href: '/admin/members', icon: Users, label: 'ЧЛЕНИ' },
  { href: '/admin/challenges', icon: Target, label: 'ВИКЛИКИ' },
  { href: '/admin/events', icon: Calendar, label: 'ПОДІЇ' },
  { href: '/admin/votes', icon: Vote, label: 'ГОЛОСУВАННЯ' },
  { href: '/admin/tasks', icon: CheckSquare, label: 'ЗАВДАННЯ' },
  { href: '/admin/news', icon: FileText, label: 'НОВИНИ' },
  { href: '/admin/pages', icon: PanelTop, label: 'СТОРІНКИ' },
  { href: '/admin/marketplace', icon: ShoppingBag, label: 'МАГАЗИН' },
  { href: '/admin/help', icon: BookOpen, label: 'ДОВІДКА' },
  { href: '/admin/notifications', icon: Bell, label: 'СПОВІЩЕННЯ' },
  { href: '/admin/analytics', icon: BarChart3, label: 'АНАЛІТИКА' },
  { href: '/admin/settings', icon: Settings, label: 'НАЛАШТУВАННЯ' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
          <div>
            <span className="font-syne font-bold text-lg tracking-tight block">
              АДМІН
            </span>
            <span className="text-xs text-muted-500">Панель керування</span>
          </div>
        </Link>
      </div>

      {/* Back to dashboard */}
      <div className="p-4 border-b border-line">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-muted-500 hover:text-text-100 transition-colors"
        >
          <ArrowLeft size={14} />
          До кабінету
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider transition-colors rounded ${
                    isActive ? 'bg-bronze text-bg-950' : 'hover:bg-panel-850'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-line">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider hover:bg-panel-850 rounded w-full transition-colors"
        >
          <LogOut size={18} />
          ВИЙТИ
        </button>
      </div>
    </aside>
  );
}
