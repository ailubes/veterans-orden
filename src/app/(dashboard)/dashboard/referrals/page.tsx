import { createClient } from '@/lib/supabase/server';
import { ReferralClient } from './referral-client';
import { formatDate } from '@/lib/utils';

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile with referral code
  const { data: profile } = await supabase
    .from('users')
    .select('id, referral_code, referral_count, points')
    .eq('clerk_id', user?.id)
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
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <p className="label mb-2">ЗАПРОШЕНО ВСЬОГО</p>
          <p className="font-syne text-4xl font-bold">{referralCount}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <p className="label mb-2">АКТИВНИХ</p>
          <p className="font-syne text-4xl font-bold">
            {referrals?.filter((r) => r.status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <p className="label mb-2">ЗАРОБЛЕНО БАЛІВ</p>
          <p className="font-syne text-4xl font-bold">{earnedPoints}</p>
        </div>
      </div>

      {/* Referral List */}
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-4">МОЇ ЗАПРОШЕНІ</p>

        {referrals && referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-timber-dark/5 border border-timber-dark/10"
              >
                <div>
                  <p className="font-bold">
                    {referral.first_name} {referral.last_name}
                  </p>
                  <p className="text-sm text-timber-beam">
                    Приєднався {formatDate(referral.created_at)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold ${
                    referral.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {referral.status === 'active' ? 'АКТИВНИЙ' : 'ОЧІКУЄ'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-timber-beam">
            <p className="text-sm">Поки що немає запрошених</p>
            <p className="text-xs mt-2 opacity-60">
              Поділіться посиланням з друзями, щоб розширити Мережу
            </p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mt-8 bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-4">ЯК ЦЕ ПРАЦЮЄ</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="w-10 h-10 bg-timber-dark text-canvas flex items-center justify-center font-syne font-bold mb-3">
              1
            </div>
            <h3 className="font-syne font-bold mb-2">Поділіться посиланням</h3>
            <p className="text-sm text-timber-beam">
              Надішліть ваше унікальне посилання друзям та знайомим
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-timber-dark text-canvas flex items-center justify-center font-syne font-bold mb-3">
              2
            </div>
            <h3 className="font-syne font-bold mb-2">Друг реєструється</h3>
            <p className="text-sm text-timber-beam">
              Коли друг зареєструється за вашим посиланням, він стане вашим
              рефералом
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-timber-dark text-canvas flex items-center justify-center font-syne font-bold mb-3">
              3
            </div>
            <h3 className="font-syne font-bold mb-2">Отримуйте бали</h3>
            <p className="text-sm text-timber-beam">
              Ви отримуєте бали за кожного активного реферала
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
