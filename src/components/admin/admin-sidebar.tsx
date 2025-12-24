'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'ОГЛЯД' },
  { href: '/admin/members', icon: Users, label: 'ЧЛЕНИ' },
  { href: '/admin/content', icon: FileText, label: 'КОНТЕНТ' },
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
    <aside className="hidden lg:flex flex-col w-64 bg-timber-dark text-canvas min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-canvas/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent flex items-center justify-center">
            <span className="text-canvas font-syne font-bold text-xl">А</span>
          </div>
          <div>
            <span className="font-syne font-bold text-lg tracking-tight block">
              АДМІН
            </span>
            <span className="text-xs opacity-60">Панель керування</span>
          </div>
        </Link>
      </div>

      {/* Back to dashboard */}
      <div className="p-4 border-b border-canvas/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={14} />
          До кабінету
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
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
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider transition-colors ${
                    isActive ? 'bg-accent text-canvas' : 'hover:bg-canvas/10'
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
