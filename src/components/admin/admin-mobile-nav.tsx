'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
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
  { href: '/admin/marketplace', icon: ShoppingBag, label: 'МАГАЗИН' },
  { href: '/admin/help', icon: BookOpen, label: 'ДОВІДКА' },
  { href: '/admin/notifications', icon: Bell, label: 'СПОВІЩЕННЯ' },
  { href: '/admin/analytics', icon: BarChart3, label: 'АНАЛІТИКА' },
  { href: '/admin/settings', icon: Settings, label: 'НАЛАШТУВАННЯ' },
];

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="lg:hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-timber-dark text-canvas">
        <Link href="/admin" className="flex items-center gap-3">
          <Logo size={32} className="text-accent" />
          <div>
            <span className="font-syne font-bold tracking-tight">АДМІН</span>
          </div>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="fixed inset-0 top-[60px] bg-timber-dark text-canvas z-50 overflow-y-auto">
          {/* Back to dashboard */}
          <div className="p-4 border-b border-canvas/10">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft size={16} />
              До кабінету
            </Link>
          </div>

          {/* Navigation items */}
          <ul className="p-4 space-y-1">
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
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 text-sm font-bold tracking-wider transition-colors ${
                      isActive
                        ? 'bg-accent text-canvas'
                        : 'hover:bg-canvas/10'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sign out */}
          <div className="p-4 border-t border-canvas/10">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-4 text-sm font-bold tracking-wider hover:bg-canvas/10 w-full transition-colors"
            >
              <LogOut size={20} />
              ВИЙТИ
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
