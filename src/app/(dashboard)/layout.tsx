import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { MessengerWrapper } from '@/components/messaging/messenger-wrapper';
import { checkProfileCompletion, type UserProfile } from '@/lib/profile-completion';

export default async function DashboardLayout({
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

  // Check if user profile is complete
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, phone, date_of_birth, katottg_code')
    .eq('clerk_id', user.id)
    .single();

  const completionStatus = checkProfileCompletion(profile as unknown as UserProfile);

  // Redirect to profile completion if incomplete
  if (!completionStatus.isComplete) {
    redirect('/complete-profile');
  }

  return (
    <MessengerWrapper>
      <div className="min-h-screen bg-canvas">
        <GrainOverlay />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <MobileNav />
            <DashboardHeader />
            <main className="flex-1 p-4 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </MessengerWrapper>
  );
}
