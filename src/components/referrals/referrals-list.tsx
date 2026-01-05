'use client';

import { formatDate } from '@/lib/utils';
import FeatureGate from '@/components/ui/feature-gate';

interface ReferralsListProps {
  referrals: any[] | null;
}

export default function ReferralsList({ referrals }: ReferralsListProps) {
  return (
    <FeatureGate featureKey="referrals_tree_view">
      <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <p className="label text-bronze mb-4">МОЇ ЗАПРОШЕНІ</p>

        {referrals && referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-timber-dark/5 border border-line/10"
              >
                <div>
                  <p className="font-bold">
                    {referral.first_name} {referral.last_name}
                  </p>
                  <p className="text-sm text-muted-500">
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
          <div className="text-center py-12 text-muted-500">
            <p className="text-sm">Поки що немає запрошених</p>
            <p className="text-xs mt-2 opacity-60">
              Поділіться посиланням з друзями, щоб розширити Мережу
            </p>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
