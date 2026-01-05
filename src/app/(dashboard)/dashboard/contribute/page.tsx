'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MembershipUpgrade } from '@/components/dashboard/membership-upgrade';
import { DollarSign, Loader2, Heart } from 'lucide-react';

export default function ContributePage() {
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState('free');

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('membership_tier')
          .eq('auth_id', user.id)
          .single();

        if (profile) {
          setCurrentTier(profile.membership_tier || 'free');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-accent" />
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">
            Підтримати Мережу
          </h1>
        </div>
        <p className="text-timber-beam">
          Зробіть внесок для підвищення рівня членства та отримайте доступ до додаткових можливостей
        </p>
      </div>

      {/* Benefits Info */}
      <div className="bg-accent/10 border-2 border-accent p-6 mb-8 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="flex items-start gap-4">
          <DollarSign className="w-6 h-6 text-accent flex-shrink-0" />
          <div>
            <h2 className="font-syne font-bold text-lg mb-2">
              Чому це важливо?
            </h2>
            <p className="text-sm text-timber-dark mb-3">
              Ваші внески допомагають нам розвивати платформу, організовувати події та підтримувати спільноту активних громадян.
            </p>
            <ul className="text-sm text-timber-dark space-y-1">
              <li>• Вищий рівень = більше можливостей впливу</li>
              <li>• Доступ до голосувань на праймеріз</li>
              <li>• Можливість створювати події та завдання</li>
              <li>• Участь у реферальній програмі</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Membership Tiers */}
      <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-6">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <h2 className="font-syne font-bold text-xl mb-6">
          Оберіть рівень членства
        </h2>

        <MembershipUpgrade currentTier={currentTier} />
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-timber-beam">
        <p className="mb-2">
          Після оплати ваш рівень членства буде автоматично підвищено.
        </p>
        <p>
          Маєте питання? <a href="/help" className="text-accent hover:underline font-bold">Перегляньте довідку</a>
        </p>
      </div>
    </div>
  );
}
