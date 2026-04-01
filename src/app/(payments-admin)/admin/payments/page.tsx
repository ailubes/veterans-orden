'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Eye,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
type PaymentType = 'membership' | 'donation' | 'event';

interface PaymentListItem {
  id: string;
  user_id: string | null;
  type: PaymentType;
  amount: number;
  currency: string;
  membership_tier: string | null;
  provider: string;
  provider_transaction_id: string | null;
  provider_data: Record<string, unknown> | null;
  status: PaymentStatus;
  created_at: string;
  completed_at: string | null;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface PaymentsResponse {
  payments: PaymentListItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

function getStatusLabel(status: PaymentStatus) {
  switch (status) {
    case 'completed':
      return 'Успішно';
    case 'failed':
      return 'Помилка';
    case 'refunded':
      return 'Повернено';
    default:
      return 'Очікує';
  }
}

function getStatusClass(status: PaymentStatus) {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'failed':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'refunded':
      return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    default:
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  }
}

function getStatusIcon(status: PaymentStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={14} />;
    case 'failed':
      return <AlertTriangle size={14} />;
    default:
      return <Clock3 size={14} />;
  }
}

function getTypeLabel(type: PaymentType) {
  switch (type) {
    case 'donation':
      return 'Донат';
    case 'membership':
      return 'Членство';
    default:
      return 'Подія';
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | PaymentStatus>('all');
  const [type, setType] = useState<'all' | PaymentType>('all');
  const [query, setQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    void fetchPayments();
  }, [status, type, query]);

  async function fetchPayments() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (type !== 'all') params.set('type', type);
      if (query.trim()) params.set('query', query.trim());

      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Не вдалося завантажити платежі');
      }

      const data: PaymentsResponse = await response.json();
      setPayments(data.payments);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }

  const totals = payments.reduce(
    (acc, payment) => {
      acc.total += payment.amount;
      if (payment.status === 'completed') acc.completed += payment.amount;
      if (payment.status === 'failed') acc.failed += 1;
      if (payment.status === 'pending') acc.pending += 1;
      return acc;
    },
    { total: 0, completed: 0, failed: 0, pending: 0 }
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mono text-bronze mb-2 text-xs tracking-widest">// ПЛАТЕЖІ</p>
          <h1 className="font-syne text-3xl font-bold text-text-100">Платежі</h1>
          <p className="text-sm text-muted-500 mt-2">
            Всі платежі HUTKO з деталями провайдера та історією колбеків
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="text-xs text-muted-500 uppercase tracking-wide mb-1">Всього</p>
          <p className="font-syne text-2xl font-bold">{payments.length}</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="text-xs text-muted-500 uppercase tracking-wide mb-1">Сума</p>
          <p className="font-syne text-2xl font-bold">{totals.total} ₴</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="text-xs text-muted-500 uppercase tracking-wide mb-1">Успішно</p>
          <p className="font-syne text-2xl font-bold text-green-400">
            {totals.completed} ₴
          </p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="text-xs text-muted-500 uppercase tracking-wide mb-1">Проблемні</p>
          <p className="font-syne text-2xl font-bold text-red-400">
            {totals.failed + totals.pending}
          </p>
        </div>
      </div>

      <div className="bg-panel-900 border border-line rounded-lg p-4 mb-6 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-500"
            />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setQuery(searchValue);
                }
              }}
              placeholder="Пошук за order_id"
              className="w-full rounded-lg border border-line bg-bg-950 py-2 pl-9 pr-3 text-sm text-text-100 outline-none"
            />
          </div>
          <button
            onClick={() => setQuery(searchValue)}
            className="rounded-lg bg-bronze px-4 py-2 text-sm font-bold text-bg-950"
          >
            Знайти
          </button>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'all' | PaymentStatus)}
            className="rounded-lg border border-line bg-bg-950 px-3 py-2 text-sm text-text-100"
          >
            <option value="all">Всі статуси</option>
            <option value="pending">Очікує</option>
            <option value="completed">Успішно</option>
            <option value="failed">Помилка</option>
            <option value="refunded">Повернено</option>
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as 'all' | PaymentType)}
            className="rounded-lg border border-line bg-bg-950 px-3 py-2 text-sm text-text-100"
          >
            <option value="all">Всі типи</option>
            <option value="membership">Членство</option>
            <option value="donation">Донат</option>
            <option value="event">Подія</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-line bg-panel-900 p-12 text-center text-muted-500">
          Завантаження платежів...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-lg border border-line bg-panel-900 p-12 text-center text-muted-500">
          <CreditCard className="mx-auto mb-4" size={36} />
          Платежів не знайдено
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-panel-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead className="bg-panel-850 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    Тип
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    Сума
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    Користувач
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    HUTKO
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    Логи
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted-500">
                    Створено
                  </th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-500">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const providerData = (payment.provider_data || {}) as Record<
                    string,
                    unknown
                  >;
                  const callbackEvents = Array.isArray(providerData.callback_events)
                    ? providerData.callback_events
                    : [];

                  return (
                    <tr key={payment.id} className="border-t border-line/60">
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(payment.status)}`}
                        >
                          {getStatusIcon(payment.status)}
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-text-100">
                        {getTypeLabel(payment.type)}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-text-100">
                        {payment.amount} {payment.currency}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-100">
                        {payment.users ? (
                          <div>
                            <p>
                              {payment.users.first_name} {payment.users.last_name}
                            </p>
                            <p className="text-xs text-muted-500">{payment.users.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-text-100">
                        {payment.provider_transaction_id || '—'}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-500">
                        <div className="space-y-1">
                          <p>status: {String(providerData.hutko_order_status || '—')}</p>
                          <p>code: {String(providerData.hutko_response_code || '—')}</p>
                          <p>card: {String(providerData.hutko_masked_card || '—')}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-500">
                        {callbackEvents.length > 0
                          ? `${callbackEvents.length} колбек(ів)`
                          : 'Немає'}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-500">
                        {new Date(payment.created_at).toLocaleString('uk-UA')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/payments/${payment.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-bold text-text-100 transition-colors hover:bg-panel-850"
                        >
                          <Eye size={14} />
                          Деталі
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
