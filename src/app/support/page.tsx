'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function SupportPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(100);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const effectiveAmount = custom ? Number(custom) : selected;

  const handleDonate = async () => {
    if (!effectiveAmount || effectiveAmount < 10) {
      setError('Мінімальна сума — 10 ₴');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/payments/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: effectiveAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Помилка. Спробуйте пізніше.');
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      router.push(`/pay?token=${data.hutkoToken}&amount=${data.amount}&type=donation`);
    } catch {
      setError('Помилка зʼєднання. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        subtitle="// ФІНАНСОВА ПІДТРИМКА"
        title="ПІДТРИМАТИ"
        description="Внесок у конкретну систему: підтримку ветеранів, адаптацію, захист прав, психологічні маршрути та громадянські ініціативи."
      />

      <PageContent narrow>
        <p>
          Підтримка Ордену Ветеранів — це не "донат у порожнечу". Це внесок у конкретну систему:
          підтримку ветеранів, адаптацію, захист прав, психологічні маршрути, навчальні події та громадянські ініціативи.
        </p>

        <p>
          Ми будуємо прозорий підхід: цілі зборів, підтверджувальні документи та звіти (у міру можливостей і потреб).
          Для нас важливо, щоб довіра була не словами, а механікою.
        </p>

        {/* Donation form */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Оберіть суму підтримки</h2>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelected(amt); setCustom(''); setError(''); }}
                style={{
                  padding: '0.6rem 1.4rem',
                  border: `2px solid ${selected === amt && !custom ? 'var(--bronze)' : 'var(--border-line, #333)'}`,
                  borderRadius: '6px',
                  background: selected === amt && !custom ? 'var(--bronze)' : 'transparent',
                  color: selected === amt && !custom ? 'var(--bg-950, #0a0a0a)' : 'var(--text-100, #fff)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {amt} ₴
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-500)', marginBottom: '0.5rem' }}>
              Інша сума (₴)
            </label>
            <input
              type="number"
              min={10}
              max={50000}
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); setError(''); }}
              placeholder="Введіть суму"
              style={{
                width: '100%',
                maxWidth: '240px',
                padding: '0.65rem 1rem',
                background: 'var(--bg-panel-850, #1a1a1a)',
                border: `2px solid ${custom ? 'var(--bronze)' : 'var(--border-line, #333)'}`,
                borderRadius: '6px',
                color: 'var(--text-100, #fff)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--red-400, #f87171)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <HeavyCta
            variant="primary"
            size="lg"
            disabled={loading || !effectiveAmount}
            onClick={handleDonate}
          >
            {loading ? 'ПІДГОТОВКА...' : `ЗАДОНАТИТИ${effectiveAmount ? ` ${effectiveAmount} ₴` : ''}`}
          </HeavyCta>
        </div>
      </PageContent>

      {/* Partnership CTA */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--muted-500)' }}>
              Якщо ви бізнес або партнерська організація — зв'яжіться з нами.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/contacts" variant="outline" size="lg">
                ЗВ'ЯЗАТИСЯ
              </HeavyCta>
              <HeavyCta href="/support/partnership" variant="outline" size="lg">
                ПАРТНЕРСТВО
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
