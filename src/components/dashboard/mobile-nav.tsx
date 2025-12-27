'use client';

import { useState, useEffect } from 'react';
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
  Shield,
  Bell,
  ShoppingBag,
  ShoppingCart,
  Coins,
  HelpCircle,
  Target,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';
import { NotificationBell } from './notification-bell';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'ОГЛЯД' },
  { href: '/dashboard/referrals', icon: Users, label: 'ЗАПРОШЕННЯ' },
  { href: '/dashboard/challenges', icon: Target, label: 'ВИКЛИКИ' },
  { href: '/dashboard/events', icon: Calendar, label: 'ПОДІЇ' },
  { href: '/dashboard/votes', icon: Vote, label: 'ГОЛОСУВАННЯ' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'ЗАВДАННЯ' },
  { href: '/dashboard/marketplace', icon: ShoppingBag, label: 'МАГАЗИН' },
  { href: '/dashboard/points', icon: Coins, label: 'МОЇ БАЛИ' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'РЕЙТИНГ' },
  { href: '/help', icon: HelpCircle, label: 'ДОПОМОГА' },
  { href: '/dashboard/notifications', icon: Bell, label: 'ПОВІДОМЛЕННЯ' },
  { href: '/dashboard/settings', icon: Settings, label: 'НАЛАШТУВАННЯ' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('clerk_id', user.id)
          .single();

        const adminRoles = ['admin', 'super_admin', 'regional_leader'];
        setIsAdmin(Boolean(profile && adminRoles.includes(profile.role)));
      }
    };

    checkAdminStatus();
  }, []);

  // Track cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartItemCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, []);

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

        <div className="flex items-center gap-2">
          <NotificationBell variant="dark" />
          <Link href="/dashboard/marketplace/checkout" className="relative p-2">
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-canvas text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
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

            {/* Cart Link with Badge */}
            <li>
              <Link
                href="/dashboard/marketplace/checkout"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 text-sm font-bold tracking-wider transition-colors relative ${
                  pathname === '/dashboard/marketplace/checkout'
                    ? 'bg-accent text-canvas'
                    : 'hover:bg-canvas/10'
                }`}
              >
                <ShoppingCart size={20} />
                КОШИК
                {cartItemCount > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-canvas text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Admin Link - only visible to admins */}
            {isAdmin && (
              <li className="pt-4 mt-4 border-t border-canvas/10">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 text-sm font-bold tracking-wider transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'bg-accent text-canvas'
                      : 'hover:bg-canvas/10'
                  }`}
                >
                  <Shield size={20} />
                  АДМІН-ПАНЕЛЬ
                </Link>
              </li>
            )}
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
