'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DefaultAvatar, type UserSex } from '@/components/ui/default-avatar';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  sex: UserSex;
  role: string;
  staff_role: string | null;
}

interface UserDropdownProps {
  profile: UserProfile | null;
}

export function UserDropdown({ profile }: UserDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isAdmin = profile && (
    ['admin', 'super_admin'].includes(profile.role) ||
    ['admin', 'super_admin'].includes(profile.staff_role || '')
  );

  const getInitials = () => {
    if (!profile) return '?';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-panel-850 transition-colors focus:outline-none">
          {profile?.avatar_url ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-line">
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <DefaultAvatar sex={profile?.sex} size="sm" fallbackInitials={getInitials()} />
          )}
          <ChevronDown className="w-4 h-4 text-muted-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-panel-900 border border-line" sideOffset={8}>
        {/* User info header */}
        <div className="px-4 py-3 border-b border-line">
          <p className="font-bold text-sm text-text-100 truncate">
            {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-xs text-muted-500 mt-0.5">Учасник</p>
        </div>

        <div className="py-2">
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-text-100 hover:bg-panel-850 hover:text-bronze transition-colors"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} />
              <span className="text-sm">Кабінет</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-text-100 hover:bg-panel-850 hover:text-bronze transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings size={16} />
              <span className="text-sm">Налаштування</span>
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-text-100 hover:bg-panel-850 hover:text-bronze transition-colors"
                onClick={() => setOpen(false)}
              >
                <Shield size={16} />
                <span className="text-sm">Адмін-панель</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-line" />

        <div className="py-2">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm">Вийти</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
