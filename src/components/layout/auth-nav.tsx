'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { UserDropdown } from './user-dropdown';
import type { UserSex } from '@/components/ui/default-avatar';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  sex: UserSex;
  role: string;
  staff_role: string | null;
}

export function AuthNav() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('first_name, last_name, avatar_url, sex, role, staff_role')
            .eq('auth_id', session.user.id)
            .single();
          setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="w-24 h-9 bg-panel-850 rounded animate-pulse" />;
  }

  // Logged out - show only sign-in button with bronze background
  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="nav-signin-btn"
      >
        УВІЙТИ
      </Link>
    );
  }

  // Logged in - show user dropdown
  return <UserDropdown profile={profile} />;
}
