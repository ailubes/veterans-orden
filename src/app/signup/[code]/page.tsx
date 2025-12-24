import { redirect } from 'next/navigation';

interface SignupPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { code } = await params;

  // Redirect to sign-up with referral code as query parameter
  redirect(`/sign-up?ref=${code}`);
}
