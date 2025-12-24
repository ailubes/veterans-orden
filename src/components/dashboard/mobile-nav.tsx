'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  Vote,
  CheckSquare,
  Settings,
  LogOut,
  Trophy,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'ОГЛЯД' },
  { href: '/dashboard/referrals', icon: Users, label: 'ЗАПРОШЕННЯ' },
  { href: '/dashboard/events', icon: Calendar, label: 'ПОДІЇ' },
  { href: '/dashboard/votes', icon: Vote, label: 'ГОЛОСУВАННЯ' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'ЗАВДАННЯ' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'РЕЙТИНГ' },
  { href: '/dashboard/settings', icon: Settings, label: 'НАЛАШТУВАННЯ' },
];

export function MobileNav() {
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
        <Link href="/" className="flex items-center gap-3">
          <Logo size={32} className="text-canvas" />
          <span className="font-syne font-bold tracking-tight">МЕРЕЖА</span>
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
        <nav className="fixed inset-0 top-[60px] bg-timber-dark text-canvas z-50 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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

          <div className="mt-4 pt-4 border-t border-canvas/10">
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
