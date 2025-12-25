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
    .select('role')
    .eq('clerk_id', user.id)
    .single();

  const adminRoles = ['admin', 'super_admin', 'regional_leader'];
  if (!profile || !adminRoles.includes(profile.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-canvas">
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
