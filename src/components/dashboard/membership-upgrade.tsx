'use client';

import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';

interface SupportCardProps {
  currentTier: string;
}

/**
 * "Support the Organization" card.
 *
 * As of 2026-06-13, payments no longer gate membership. A member's role in
 * the Order is determined by their network activity (referrals), not by a
 * support-tier payment. This card surfaces the voluntary /support donation
 * flow so members who want to financially back the Order still have a clear
 * path. The tier shown is the user's current support subscription (or none).
 */
export function SupportCard({ currentTier }: SupportCardProps) {
  const isSupporting = currentTier && currentTier !== 'free';

  return (
    <div className="border-2 border-bronze/40 bg-bronze/5 card-with-joints p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-bronze/10 border border-bronze/30 flex items-center justify-center">
          <Heart className="w-6 h-6 text-bronze" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-syne font-bold text-lg text-text-100 mb-1">
            Підтримати Орден
          </h3>
          <p className="text-sm text-text-100/80 mb-3">
            Членство розвивається через мережу. Бажаєте фінансово підтримати
            Орден? Будь-яка сума допомагає ветеранам, адаптації та захисту прав.
          </p>
          {isSupporting && (
            <p className="text-xs text-muted-500 mb-3">
              Ваш поточний рівень підтримки: <span className="text-bronze font-mono">{currentTier}</span>
            </p>
          )}
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-bronze text-canvas font-mono text-sm font-semibold border-2 border-bronze hover:bg-panel-850 hover:border-line transition-all duration-200"
          >
            {isSupporting ? 'ПОДОВЖИТИ ПІДТРИМКУ' : 'ПІДТРИМАТИ'} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Backwards-compatible export so existing imports of MembershipUpgrade
// keep working. New code should use the SupportCard name.
export const MembershipUpgrade = SupportCard;
export default SupportCard;
