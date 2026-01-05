'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { MEMBERSHIP_TIERS } from '@/lib/constants';

interface MembershipUpgradeProps {
  currentTier: string;
}

export function MembershipUpgrade({ currentTier }: MembershipUpgradeProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleUpgrade = async (tierId: string) => {
    setLoading(tierId);
    setError('');

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Payment failed');
      }

      const { data, signature, checkoutUrl } = await response.json();

      // Create form and submit to LiqPay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkoutUrl;
      form.acceptCharset = 'utf-8';

      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'data';
      dataInput.value = data;
      form.appendChild(dataInput);

      const signatureInput = document.createElement('input');
      signatureInput.type = 'hidden';
      signatureInput.name = 'signature';
      signatureInput.value = signature;
      form.appendChild(signatureInput);

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка оплати');
      setLoading(null);
    }
  };

  const tiers = Object.entries(MEMBERSHIP_TIERS);
  const currentTierIndex = tiers.findIndex(([id]) => id === currentTier);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiers.map(([id, tier], index) => {
          const isCurrentTier = id === currentTier;
          const isDowngrade = index < currentTierIndex;

          return (
            <div
              key={id}
              className={`border-2 p-4 relative ${
                isCurrentTier
                  ? 'border-bronze bg-bronze/5'
                  : 'border-line hover:border-bronze/50'
              }`}
            >
              {isCurrentTier && (
                <div className="absolute -top-3 left-4 bg-bronze text-canvas px-2 py-0.5 text-xs font-bold">
                  ПОТОЧНИЙ
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-syne font-bold text-lg">{tier.name}</h3>
                  <p className="text-sm text-muted-500">{tier.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-syne text-2xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-500"> грн/міс</span>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check size={14} className="text-bronze flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              {isCurrentTier ? (
                <button
                  disabled
                  className="w-full py-2 bg-timber-dark/10 text-muted-500 text-sm font-bold cursor-not-allowed"
                >
                  АКТИВНИЙ ПЛАН
                </button>
              ) : isDowngrade ? (
                <button
                  disabled
                  className="w-full py-2 bg-timber-dark/10 text-muted-500 text-sm font-bold cursor-not-allowed"
                >
                  ЗНИЖЕННЯ НЕДОСТУПНЕ
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(id)}
                  disabled={loading !== null}
                  className="w-full btn justify-center text-sm disabled:opacity-50"
                >
                  {loading === id ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      ОБРОБКА...
                    </>
                  ) : (
                    `ОБРАТИ ${tier.name.toUpperCase()} →`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-500 text-center">
        Оплата здійснюється через захищений сервіс LiqPay. Членство активується одразу після оплати.
      </p>
    </div>
  );
}
