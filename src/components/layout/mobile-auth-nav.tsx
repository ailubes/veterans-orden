'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { LogOut, LayoutDashboard, Settings, Shield } from 'lucide-react';
import { DefaultAvatar, type UserSex } from '@/components/ui/default-avatar';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  sex: UserSex;
  role: string;
  staff_role: string | null;
}

interface MobileAuthNavProps {
  onClose: () => void;
}

export function MobileAuthNav({ onClose }: MobileAuthNavProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('first_name, last_name, avatar_url, sex, role, staff_role')
          .eq('auth_id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push('/');
    router.refresh();
  };

  const getInitials = () => {
    if (!profile) return '?';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  if (loading) {
    return <div className="w-full h-12 bg-panel-850 rounded animate-pulse" />;
  }

  // Logged out state
  if (!user) {
    return (
      <div className="flex flex-col gap-3 w-full pt-4 border-t border-line">
        <HeavyCta href="/sign-in" variant="outline" size="lg" fullWidth onClick={onClose}>
          УВІЙТИ
        </HeavyCta>
        <HeavyCta href="/sign-up" variant="primary" size="lg" fullWidth onClick={onClose}>
          ПРИЄДНАТИСЯ
        </HeavyCta>
      </div>
    );
  }

  // Logged in state - show quick links
  const isAdmin = profile && (
    ['admin', 'super_admin'].includes(profile.role) ||
    ['admin', 'super_admin'].includes(profile.staff_role || '')
  );

  return (
    <div className="flex flex-col gap-2 w-full pt-4 border-t border-line">
      {/* User info */}
      <div className="flex items-center gap-3 px-2 py-3">
        {profile?.avatar_url ? (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-line">
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <DefaultAvatar sex={profile?.sex} size="md" fallbackInitials={getInitials()} />
        )}
        <div>
          <p className="font-bold text-text-100">{profile?.first_name} {profile?.last_name}</p>
          <p className="text-xs text-muted-500">Учасник</p>
        </div>
      </div>

      <Link
        href="/dashboard"
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-3 text-text-100 hover:bg-panel-850 hover:text-bronze rounded-lg transition-colors"
      >
        <LayoutDashboard size={18} />
        <span className="font-mono text-sm uppercase tracking-wider">Кабінет</span>
      </Link>

      <Link
        href="/dashboard/settings"
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-3 text-text-100 hover:bg-panel-850 hover:text-bronze rounded-lg transition-colors"
      >
        <Settings size={18} />
        <span className="font-mono text-sm uppercase tracking-wider">Налаштування</span>
      </Link>

      {isAdmin && (
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-text-100 hover:bg-panel-850 hover:text-bronze rounded-lg transition-colors"
        >
          <Shield size={18} />
          <span className="font-mono text-sm uppercase tracking-wider">Адмін-панель</span>
        </Link>
      )}

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
      >
        <LogOut size={18} />
        <span className="font-mono text-sm uppercase tracking-wider">Вийти</span>
      </button>
    </div>
  );
}
