'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';

interface CallbackEvent {
  received_at: string;
  order_status: string | null;
  response_status: string | null;
  response_code: string | null;
  response_description: string | null;
  payment_id: string | null;
  amount: string | null;
  actual_amount: string | null;
  payment_system: string | null;
  masked_card: string | null;
  raw: Record<string, string>;
}

interface PaymentDetail {
  id: string;
  user_id: string | null;
  type: string;
  amount: number;
  currency: string;
  membership_tier: string | null;
  provider: string;
  provider_transaction_id: string | null;
  provider_data: Record<string, unknown> | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  completed_at: string | null;
  period_start: string | null;
  period_end: string | null;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    membership_tier?: string;
    membership_role?: string;
    staff_role?: string;
  } | null;
}

export default function AdminPaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPayment();
  }, [params.id]);

  async function fetchPayment() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/payments/${params.id}`);
      if (!response.ok) {
        throw new Error('Не вдалося завантажити платіж');
      }

      const data = (await response.json()) as { payment: PaymentDetail };
      setPayment(data.payment);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-500">Завантаження...</div>;
  }

  if (error || !payment) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300 mb-4">
          {error || 'Платіж не знайдено'}
        </div>
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-muted-500 hover:text-text-100"
        >
          <ArrowLeft size={16} />
          Повернутися до платежів
        </Link>
      </div>
    );
  }

  const providerData = (payment.provider_data || {}) as Record<string, unknown>;
  const callbackEvents = (Array.isArray(providerData.callback_events)
    ? providerData.callback_events
    : []) as CallbackEvent[];

  const statusIcon =
    payment.status === 'completed' ? (
      <CheckCircle2 size={16} className="text-green-400" />
    ) : payment.status === 'failed' ? (
      <AlertTriangle size={16} className="text-red-400" />
    ) : (
      <Clock3 size={16} className="text-yellow-400" />
    );

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        href="/admin/payments"
        className="inline-flex items-center gap-2 text-muted-500 hover:text-text-100 mb-6"
      >
        <ArrowLeft size={16} />
        Повернутися до платежів
      </Link>

      <div className="rounded-lg border border-line bg-panel-900 p-6 mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mono text-bronze mb-2 text-xs tracking-widest">
              // ДЕТАЛІ ПЛАТЕЖУ
            </p>
            <h1 className="font-syne text-3xl font-bold text-text-100">
              {payment.provider_transaction_id || payment.id}
            </h1>
            <p className="text-sm text-muted-500 mt-2">
              Створено: {new Date(payment.created_at).toLocaleString('uk-UA')}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold">
            {statusIcon}
            {payment.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-line bg-panel-900 p-6">
            <h2 className="font-bold text-text-100 mb-4">Підсумок</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">Тип</span>
                <span>{payment.type}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">Сума</span>
                <span>
                  {payment.amount} {payment.currency}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">Провайдер</span>
                <span>{payment.provider}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">HUTKO статус</span>
                <span>{String(providerData.hutko_order_status || '—')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">Response code</span>
                <span>{String(providerData.hutko_response_code || '—')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">Bank code</span>
                <span>{String(providerData.hutko_bank_response_code || '—')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">Payment ID</span>
                <span>{String(providerData.hutko_payment_id || '—')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-500">Картка</span>
                <span>{String(providerData.hutko_masked_card || '—')}</span>
              </div>
              {payment.membership_tier ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-500">Тариф</span>
                  <span>{payment.membership_tier}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel-900 p-6">
            <h2 className="font-bold text-text-100 mb-4">Користувач</h2>
            {payment.users ? (
              <div className="space-y-2 text-sm">
                <p className="text-text-100 font-medium">
                  {payment.users.first_name} {payment.users.last_name}
                </p>
                <p className="text-muted-500">{payment.users.email}</p>
                {payment.users.phone ? (
                  <p className="text-muted-500">{payment.users.phone}</p>
                ) : null}
                <p className="text-muted-500">
                  membership_role: {payment.users.membership_role || '—'}
                </p>
                <p className="text-muted-500">
                  staff_role: {payment.users.staff_role || '—'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-500">Платіж без прив’язаного акаунта</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-line bg-panel-900 p-6">
            <h2 className="font-bold text-text-100 mb-4">Помилки провайдера</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-500 mb-1">
                  Response description
                </p>
                <p className="text-text-100">
                  {String(providerData.hutko_response_description || '—')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-500 mb-1">
                  Bank response description
                </p>
                <p className="text-text-100">
                  {String(providerData.hutko_bank_response_description || '—')}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel-900 p-6">
            <h2 className="font-bold text-text-100 mb-4">Логи колбеків</h2>
            {callbackEvents.length === 0 ? (
              <p className="text-sm text-muted-500">
                Ще немає збережених колбеків для цього платежу.
              </p>
            ) : (
              <div className="space-y-4">
                {callbackEvents
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <div
                      key={`${event.received_at}-${index}`}
                      className="rounded-lg border border-line bg-bg-950 p-4"
                    >
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-3">
                        <p className="text-sm font-bold text-text-100">
                          {new Date(event.received_at).toLocaleString('uk-UA')}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-500">
                          <span>order_status: {event.order_status || '—'}</span>
                          <span>response_code: {event.response_code || '—'}</span>
                          <span>payment_id: {event.payment_id || '—'}</span>
                        </div>
                      </div>
                      <p className="text-sm text-text-100 mb-3">
                        {event.response_description || 'Без опису помилки'}
                      </p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-bronze">
                          Показати raw callback
                        </summary>
                        <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-panel-850 p-3 text-xs text-muted-500">
                          {JSON.stringify(event.raw, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-line bg-panel-900 p-6">
            <h2 className="font-bold text-text-100 mb-4">Raw provider_data</h2>
            <pre className="overflow-x-auto rounded-lg border border-line bg-bg-950 p-4 text-xs text-muted-500">
              {JSON.stringify(providerData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
