import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { MessengerWrapper } from '@/components/messaging/messenger-wrapper';
import { checkProfileCompletion, type UserProfile } from '@/lib/profile-completion';
import { OnboardingTour } from '@/components/dashboard/onboarding-tour';

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
    .select('first_name, last_name, phone, date_of_birth, katottg_code, onboarding_completed_at, status, membership_tier, membership_paid_until')
    .eq('auth_id', user.id)
    .single();

  const completionStatus = checkProfileCompletion(profile as unknown as UserProfile);

  // Redirect to profile completion if incomplete
  if (!completionStatus.isComplete) {
    redirect('/complete-profile');
  }

  // Block suspended members (failed to pay)
  if (profile?.status === 'suspended') {
    redirect('/payment-required');
  }

  // Block paid-tier members with expired membership (past 7-day grace period)
  const paidTiers = ['basic_49', 'supporter_100', 'supporter_200', 'patron_500'];
  if (
    profile?.membership_tier &&
    paidTiers.includes(profile.membership_tier) &&
    profile?.membership_paid_until &&
    new Date(profile.membership_paid_until) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ) {
    redirect('/payment-required');
  }

  const hasCompletedOnboarding = !!(profile as any)?.onboarding_completed_at;

  return (
    <MessengerWrapper>
      <div className="min-h-screen bg-bg-950 text-text-100">
        <GrainOverlay />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <MobileNav />
            <DashboardHeader />
            <main className="flex-1 p-4 lg:p-8">{children}</main>
          </div>
        </div>
        <OnboardingTour userId={user.id} hasCompletedOnboarding={hasCompletedOnboarding} />
      </div>
    </MessengerWrapper>
  );
}
