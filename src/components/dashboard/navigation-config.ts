import {
  Home,
  Newspaper,
  Bell,
  Users2,
  Users,
  Target,
  Calendar,
  Vote,
  CheckSquare,
  Trophy,
  Briefcase,
  BookHeart,
  ShoppingBag,
  ShoppingCart,
  Coins,
  HelpCircle,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
  secondary?: boolean;
}

export interface DashboardNavGroup {
  id: string;
  title: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  items: DashboardNavItem[];
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    id: 'core',
    title: 'ОСНОВНЕ',
    items: [
      { href: '/dashboard', icon: Home, label: 'ОГЛЯД', exact: true },
      { href: '/dashboard/feed', icon: Newspaper, label: 'СТРІЧКА' },
      { href: '/dashboard/notifications', icon: Bell, label: 'ПОВІДОМЛЕННЯ' },
    ],
  },
  {
    id: 'engagement',
    title: 'УЧАСТЬ',
    items: [
      { href: '/dashboard/community', icon: Users2, label: 'СПІЛЬНОТА' },
      { href: '/dashboard/jobs', icon: Briefcase, label: 'РОБОТА' },
      { href: '/dashboard/referrals', icon: Users, label: 'ЗАПРОШЕННЯ' },
      { href: '/dashboard/challenges', icon: Target, label: 'ВИКЛИКИ' },
      { href: '/dashboard/events', icon: Calendar, label: 'ПОДІЇ' },
      { href: '/dashboard/votes', icon: Vote, label: 'ГОЛОСУВАННЯ' },
      { href: '/dashboard/tasks', icon: CheckSquare, label: 'ЗАВДАННЯ' },
      { href: '/dashboard/leaderboard', icon: Trophy, label: 'РЕЙТИНГ' },
    ],
  },
  {
    id: 'services',
    title: 'ІНСТРУМЕНТИ',
    items: [
      { href: '/dashboard/marketplace', icon: ShoppingBag, label: 'МАГАЗИН' },
      { href: '/dashboard/points', icon: Coins, label: 'МОЇ БАЛИ' },
    ],
  },
  {
    id: 'more',
    title: 'ЩЕ',
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { href: '/dashboard/resources', icon: BookHeart, label: 'РЕСУРСИ' },
      { href: '/dashboard/marketplace/checkout', icon: ShoppingCart, label: 'КОШИК', secondary: true },
      { href: '/help', icon: HelpCircle, label: 'ДОПОМОГА' },
    ],
  },
  {
    id: 'account',
    title: 'ПРОФІЛЬ',
    items: [{ href: '/dashboard/settings', icon: Settings, label: 'НАЛАШТУВАННЯ' }],
  },
];

export function isDashboardItemActive(pathname: string, item: DashboardNavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
