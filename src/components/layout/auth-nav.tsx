'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { UserDropdown } from './user-dropdown';
import type { UserSex } from '@/components/ui/default-avatar';
import type { StaffRole } from '@/lib/permissions-utils';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  sex: UserSex;
  role: string;
  staff_role: StaffRole | null;
  membership_role: string | null;
}

export function AuthNav() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('first_name, last_name, avatar_url, sex, role, staff_role, membership_role')
          .eq('auth_id', user.id)
          .single();
        setProfile(data);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('first_name, last_name, avatar_url, sex, role, staff_role, membership_role')
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

  // Logged out - keep single clear auth action
  if (!user) {
    return (
      <div className="nav-auth-compact">
        <Link href="/sign-in" className="nav-signin-btn">
          УВІЙТИ
        </Link>
      </div>
    );
  }

  // Logged in - single compact profile control (dashboard/admin/settings inside dropdown)
  return (
    <div className="nav-auth-compact">
      <UserDropdown profile={profile} />
    </div>
  );
}
