import { createClient } from '@/lib/supabase/server';
import { ReferralClient } from './referral-client';
import { formatDate } from '@/lib/utils';
import ReferralsList from '@/components/referrals/referrals-list';

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile with referral code
  const { data: profile } = await supabase
    .from('users')
    .select('id, referral_code, referral_count, points')
    .eq('auth_id', user?.id)
    .single();

  // Fetch referrals (users who were referred by this user)
  const { data: referrals } = await supabase
    .from('users')
    .select('id, first_name, last_name, created_at, status')
    .eq('referred_by_id', profile?.id || '')
    .order('created_at', { ascending: false });

  const referralCode = profile?.referral_code || '';
  const referralCount = profile?.referral_count || 0;
  const earnedPoints = referralCount * 10; // 10 points per referral

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">ЗАПРОШЕННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Розширюй Мережу
        </h1>
      </div>

      {/* Referral Link Card */}
      <ReferralClient referralCode={referralCode} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <p className="label mb-2">ЗАПРОШЕНО ВСЬОГО</p>
          <p className="font-syne text-4xl font-bold">{referralCount}</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <p className="label mb-2">АКТИВНИХ</p>
          <p className="font-syne text-4xl font-bold">
            {referrals?.filter((r) => r.status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <p className="label mb-2">ЗАРОБЛЕНО БАЛІВ</p>
          <p className="font-syne text-4xl font-bold">{earnedPoints}</p>
        </div>
      </div>

      {/* Referral List */}
      <ReferralsList referrals={referrals} />

      {/* How it works */}
      <div className="mt-8 bg-panel-900 border border-line rounded-lg p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <p className="label text-bronze mb-4">ЯК ЦЕ ПРАЦЮЄ</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="w-10 h-10 bg-panel-850 text-canvas flex items-center justify-center font-syne font-bold mb-3">
              1
            </div>
            <h3 className="font-syne font-bold mb-2">Поділіться посиланням</h3>
            <p className="text-sm text-muted-500">
              Надішліть ваше унікальне посилання друзям та знайомим
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-panel-850 text-canvas flex items-center justify-center font-syne font-bold mb-3">
              2
            </div>
            <h3 className="font-syne font-bold mb-2">Друг реєструється</h3>
            <p className="text-sm text-muted-500">
              Коли друг зареєструється за вашим посиланням, він стане вашим
              рефералом
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-panel-850 text-canvas flex items-center justify-center font-syne font-bold mb-3">
              3
            </div>
            <h3 className="font-syne font-bold mb-2">Отримуйте бали</h3>
            <p className="text-sm text-muted-500">
              Ви отримуєте бали за кожного активного реферала
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
