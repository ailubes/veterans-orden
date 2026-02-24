import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/ui/logo';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { AlertCircle, Mail } from 'lucide-react';

const TIER_NAMES: Record<string, string> = {
  basic_49: 'Базовий — 49₴/міс',
  supporter_100: 'Прихильник — 100₴/міс',
  supporter_200: 'Прихильник+ — 200₴/міс',
  patron_500: 'Патрон — 500₴/міс',
};

export default async function PaymentRequiredPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let membershipTier: string | null = null;
  let membershipPaidUntil: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('membership_tier, membership_paid_until')
      .eq('auth_id', user.id)
      .single();

    membershipTier = profile?.membership_tier ?? null;
    membershipPaidUntil = profile?.membership_paid_until ?? null;
  }

  const tierLabel = membershipTier ? TIER_NAMES[membershipTier] ?? membershipTier : null;

  const formattedUntil = membershipPaidUntil
    ? new Date(membershipPaidUntil).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-bg-950 flex items-center justify-center px-4 py-12">
      <div className="bg-panel-900 border border-line rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Logo size={48} />
        </div>

        <div className="flex items-center justify-center w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full mx-auto mb-5">
          <AlertCircle size={28} className="text-red-400" />
        </div>

        <h1 className="font-inter font-black text-2xl text-text-100 text-center mb-2 mt-0">
          Членство призупинено
        </h1>
        <p className="text-sm text-muted-500 text-center mb-6">
          Ваше членство в Ордені Ветеранів призупинено через несплату членського внеску.
        </p>

        {tierLabel && (
          <div className="bg-panel-850 border border-line rounded-lg p-4 mb-4 text-sm">
            <div className="flex justify-between text-muted-500">
              <span>Ваш план</span>
              <span className="text-text-100">{tierLabel}</span>
            </div>
            {formattedUntil && (
              <div className="flex justify-between text-muted-500 mt-2">
                <span>Оплачено до</span>
                <span className="text-red-400">{formattedUntil}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={membershipTier ? `/pay?renew=1&tier=${membershipTier}` : '/onboarding'}
          >
            <HeavyCta variant="primary" size="lg" fullWidth>
              ПОНОВИТИ ЧЛЕНСТВО
            </HeavyCta>
          </Link>

          <a
            href="mailto:info@ordenv.org"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-muted-500 hover:text-text-100 transition-colors"
          >
            <Mail size={15} />
            Зв&apos;язатися з підтримкою
          </a>
        </div>
      </div>
    </div>
  );
}
