import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user has already completed onboarding (exists in users table)
  const { data: userProfile } = await supabase
    .from('users')
    .select('id, role, status')
    .eq('auth_id', user.id)
    .single();

  // If user profile exists and is active, they've completed onboarding
  if (userProfile && userProfile.status === 'active') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-bg-950">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
