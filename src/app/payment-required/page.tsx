import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/ui/logo';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { Users, Mail } from 'lucide-react';

/**
 * /payment-required
 *
 * As of 2026-06-13, a failed payment does NOT suspend a user — membership
 * role advancement is driven entirely by referral activity (see
 * supabase/migrations/20260613000001_*). This page is kept reachable for
 * any case where an admin needs to point a user at the progression hub
 * (e.g. after a HUTKO chargeback, or any other manual review). The page
 * no longer offers a "renew membership" CTA — instead it routes the user
 * to their network-growth progression page, which is the new membership
 * upgrade path.
 */
export default async function PaymentRequiredPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firstName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('first_name')
      .eq('auth_id', user.id)
      .single();

    firstName = profile?.first_name ?? null;
  }

  return (
    <div className="min-h-screen bg-bg-950 flex items-center justify-center px-4 py-12">
      <div className="bg-panel-900 border border-line rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Logo size={48} />
        </div>

        <div className="flex items-center justify-center w-14 h-14 bg-bronze/10 border border-bronze/30 rounded-full mx-auto mb-5">
          <Users size={28} className="text-bronze" />
        </div>

        <h1 className="font-inter font-black text-2xl text-text-100 text-center mb-2 mt-0">
          {firstName ? `${firstName}, ваш наступний крок — мережа` : 'Ваш наступний крок — мережа'}
        </h1>

        <p className="text-sm text-muted-500 text-center mb-6">
          Членство в Ордені розвивається через запрошення нових учасників.
          Перегляньте свій прогрес та запросіть першого реферала, щоб перейти
          на рівень «Кандидат в члени».
        </p>

        <div className="space-y-3">
          <Link href="/dashboard/progression">
            <HeavyCta variant="primary" size="lg" fullWidth>
              ДО ПРОГРЕСУ В МЕРЕЖІ
            </HeavyCta>
          </Link>

          <Link href="/dashboard/referrals">
            <HeavyCta variant="outline" size="lg" fullWidth>
              ЗАПРОСИТИ ДРУЗІВ
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
