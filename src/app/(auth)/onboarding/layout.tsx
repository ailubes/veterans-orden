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
    .eq('clerk_id', user.id)
    .single();

  // If user profile exists and is active, they've completed onboarding
  if (userProfile && userProfile.status === 'active') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Grain overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
