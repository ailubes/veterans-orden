import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import ImpersonationBanner from '@/components/admin/impersonation-banner';
import { GlobalSearch } from '@/components/admin/global-search';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check user's role from the database
  const { data: profile } = await supabase
    .from('users')
    .select('role, staff_role')
    .eq('auth_id', user.id)
    .single();

  // staff_role = admin/super_admin grants full admin access
  // role = regional_leader grants regional admin access
  const hasAdminAccess = profile && (
    ['admin', 'super_admin'].includes(profile.staff_role) ||
    profile.role === 'regional_leader'
  );
  if (!hasAdminAccess) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-bg-950 text-text-100">
      <GrainOverlay />
      {/* Impersonation Banner - shows when admin is impersonating a user */}
      <ImpersonationBanner />
      {/* Global Search - Cmd+K / Ctrl+K */}
      <GlobalSearch />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminMobileNav />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
