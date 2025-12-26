'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { NotificationBell } from './notification-bell';

export function DashboardHeader() {
  const pathname = usePathname();
  const isSettingsActive = pathname === '/dashboard/settings';

  return (
    <header className="hidden lg:flex items-center justify-end gap-2 px-8 py-4 border-b border-timber-dark/10">
      <NotificationBell variant="light" />
      <Link
        href="/dashboard/settings"
        className={`p-2 rounded-lg transition-colors ${
          isSettingsActive
            ? 'bg-timber-dark text-white'
            : 'text-timber-beam hover:bg-timber-dark/5 hover:text-timber-dark'
        }`}
        title="Налаштування"
      >
        <Settings className="w-5 h-5" />
      </Link>
    </header>
  );
}
