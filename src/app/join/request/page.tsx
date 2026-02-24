'use client';

import { useState } from 'react';
import { PageLayout, PageHeader } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { Check } from 'lucide-react';

const APPLICANT_STATUSES = [
  { value: 'veteran', label: 'Військовослужбовець / ветеран' },
  { value: 'family', label: 'Член родини воїна' },
  { value: 'patriot', label: 'Патріот (цивільний, підтримує ідею)' },
];

export default function JoinRequestPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [applicantStatus, setApplicantStatus] = useState('');
  const [motivation, setMotivation] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError("Введіть ім'я та прізвище"); return; }
    if (!contact.trim()) { setError('Введіть контактні дані'); return; }
    if (!applicantStatus) { setError('Оберіть ваш статус'); return; }
    if (!agreed) { setError('Підтвердіть розуміння умов вступу'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/order-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          applicant_status: applicantStatus,
          motivation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Виникла помилка. Спробуйте ще раз.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Виникла помилка. Перевірте з\'єднання та спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <section className="section-sm">
        <Scaffold>
          <div className="col-span-full">
            <Breadcrumb
              items={[
                { label: 'Головна', href: '/' },
                { label: 'Приєднатися', href: '/join' },
                { label: 'Запит в Орден' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// ОРДЕН — ЯДРО"
        title="ПОДАТИ ЗАПИТ НА ВСТУП"
        description="Заповніть форму — ми зв'яжемося з вами для проведення співбесіди"
      />

      <section className="section">
        <Scaffold>
          <div className="col-span-6 col-start-4">

            {submitted ? (
              <div className="request-success">
                <div className="request-success__icon">
                  <Check size={32} />
                </div>
                <h2 className="request-success__title">Запит прийнято</h2>
                <p className="request-success__text">
                  Дякуємо за інтерес до Ордену Ветеранів. Ми розглянемо ваш запит
                  та зв'яжемося з вами протягом кількох днів.
                </p>
                <div className="request-success__actions">
                  <HeavyCta href="/" variant="outline" size="md">
                    НА ГОЛОВНУ
                  </HeavyCta>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="request-form" noValidate>
                <div className="request-form__field">
                  <label className="request-form__label">
                    ІМ&apos;Я ТА ПРІЗВИЩЕ <span className="request-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Іваненко Іван"
                    className="request-form__input"
                    required
                  />
                </div>

                <div className="request-form__field">
                  <label className="request-form__label">
                    КОНТАКТ <span className="request-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="email або @telegram"
                    className="request-form__input"
                    required
                  />
                  <span className="request-form__hint">Email або Telegram-нік (@username)</span>
                </div>

                <div className="request-form__field">
                  <label className="request-form__label">
                    ВАШ СТАТУС <span className="request-form__required">*</span>
                  </label>
                  <div className="request-form__radio-group">
                    {APPLICANT_STATUSES.map((s) => (
                      <label key={s.value} className="request-form__radio">
                        <input
                          type="radio"
                          name="applicantStatus"
                          value={s.value}
                          checked={applicantStatus === s.value}
                          onChange={() => setApplicantStatus(s.value)}
                          className="request-form__radio-input"
                        />
                        <span className="request-form__radio-mark" />
                        <span className="request-form__radio-label">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="request-form__field">
                  <label className="request-form__label">
                    КОРОТКО ПРО СЕБЕ
                  </label>
                  <textarea
                    value={motivation}
                    onChange={(e) => {
                      if (e.target.value.length <= 300) setMotivation(e.target.value);
                    }}
                    placeholder="Чому хочете приєднатися до Ордену? (необов'язково)"
                    rows={4}
                    className="request-form__textarea"
                  />
                  <span className="request-form__hint">{motivation.length}/300 символів</span>
                </div>

                <div className="request-form__field">
                  <label className="request-form__checkbox">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="request-form__checkbox-input"
                      required
                    />
                    <span className="request-form__checkbox-mark" />
                    <span className="request-form__checkbox-label">
                      Я розумію, що членство в Ордені передбачає дисципліну, правила та Присягу
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="request-form__error">
                    {error}
                  </div>
                )}

                <HeavyCta
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'НАДСИЛАЄТЬСЯ...' : 'НАДІСЛАТИ ЗАПИТ'}
                </HeavyCta>
              </form>
            )}
          </div>
        </Scaffold>
      </section>

      <style jsx>{`
        .request-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: var(--panel-900);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 2.5rem;
        }

        .request-form__field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .request-form__label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--muted-500);
        }

        .request-form__required {
          color: var(--bronze);
        }

        .request-form__input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--panel-850);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.875rem;
          color: var(--text-100);
          transition: border-color 0.15s ease;
          outline: none;
        }

        .request-form__input:focus {
          border-color: var(--bronze);
        }

        .request-form__input::placeholder {
          color: var(--muted-500);
        }

        .request-form__textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--panel-850);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.875rem;
          color: var(--text-100);
          transition: border-color 0.15s ease;
          outline: none;
          resize: vertical;
          min-height: 100px;
        }

        .request-form__textarea:focus {
          border-color: var(--bronze);
        }

        .request-form__textarea::placeholder {
          color: var(--muted-500);
        }

        .request-form__hint {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          color: var(--muted-500);
          line-height: 1.4;
        }

        .request-form__radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }

        .request-form__radio {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .request-form__radio-input {
          display: none;
        }

        .request-form__radio-mark {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border: 2px solid var(--line);
          border-radius: 50%;
          position: relative;
          transition: border-color 0.15s ease;
        }

        .request-form__radio-input:checked + .request-form__radio-mark {
          border-color: var(--bronze);
        }

        .request-form__radio-input:checked + .request-form__radio-mark::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: var(--bronze);
          border-radius: 50%;
        }

        .request-form__radio-label {
          font-size: 0.9rem;
          color: var(--text-200);
          line-height: 1.4;
        }

        .request-form__checkbox {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }

        .request-form__checkbox-input {
          display: none;
        }

        .request-form__checkbox-mark {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border: 2px solid var(--line);
          border-radius: 3px;
          position: relative;
          margin-top: 2px;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .request-form__checkbox-input:checked + .request-form__checkbox-mark {
          border-color: var(--bronze);
          background: var(--bronze);
        }

        .request-form__checkbox-input:checked + .request-form__checkbox-mark::after {
          content: '';
          position: absolute;
          top: 1px;
          left: 4px;
          width: 5px;
          height: 9px;
          border: 2px solid var(--bg-950);
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
        }

        .request-form__checkbox-label {
          font-size: 0.875rem;
          color: var(--text-200);
          line-height: 1.5;
        }

        .request-form__error {
          padding: 0.875rem 1rem;
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: var(--radius);
          font-size: 0.875rem;
          color: #f87171;
        }

        /* Success state */
        .request-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 3rem 2rem;
          background: var(--panel-900);
          border: 1px solid var(--bronze);
          border-radius: var(--radius);
        }

        .request-success__icon {
          width: 64px;
          height: 64px;
          background: var(--bronze);
          color: var(--bg-950);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .request-success__title {
          font-family: 'Inter', sans-serif;
          font-size: 1.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: var(--text-100);
          margin: 0 0 1rem;
        }

        .request-success__text {
          font-size: 1rem;
          color: var(--text-200);
          line-height: 1.6;
          margin: 0 0 2rem;
          max-width: 420px;
        }

        .request-success__actions {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .request-form {
            padding: 1.5rem;
          }
        }
      `}</style>
    </PageLayout>
  );
}
