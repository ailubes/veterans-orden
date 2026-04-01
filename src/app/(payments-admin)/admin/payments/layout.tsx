import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import ImpersonationBanner from '@/components/admin/impersonation-banner';
import { GlobalSearch } from '@/components/admin/global-search';
import {
  canAccessPaymentsAdmin,
  isStaffAdmin,
  type StaffRole,
} from '@/lib/permissions-utils';

export default async function PaymentsAdminLayout({
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

  const { data: profile } = await supabase
    .from('users')
    .select('staff_role')
    .eq('auth_id', user.id)
    .single();

  const staffRole = (profile?.staff_role || 'none') as StaffRole;

  if (!canAccessPaymentsAdmin(staffRole)) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-bg-950 text-text-100">
      <GrainOverlay />
      <ImpersonationBanner />
      {isStaffAdmin(staffRole) ? <GlobalSearch /> : null}
      <div className="flex">
        <AdminSidebar staffRole={staffRole} />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminMobileNav staffRole={staffRole} />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
