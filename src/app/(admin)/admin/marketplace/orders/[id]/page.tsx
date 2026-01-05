'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import type { OrderWithItems, OrderStatus } from '@/lib/marketplace/types';

interface OrderResponse {
  order: OrderWithItems & {
    users: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
    order_items: any[];
  };
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/admin/marketplace/orders/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data: OrderResponse = await response.json();
      setOrder(data.order);
      setStatus(data.order.status);
      setTrackingNumber(data.order.trackingNumber || '');
      setAdminNotes(data.order.adminNotes || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/marketplace/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || null,
          adminNotes: adminNotes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order');
      }

      alert('Замовлення оновлено успішно!');
      fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12 text-muted-500">Завантаження...</div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border-2 border-red-600 p-4 text-red-600 mb-4">
          {error}
        </div>
        <Link
          href="/admin/marketplace/orders"
          className="inline-flex items-center gap-2 bg-bronze text-canvas px-6 py-3 font-bold hover:bg-bronze/90 transition-colors"
        >
          <ArrowLeft size={20} />
          Повернутися до замовлень
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const uahValue = pointsToUAH(order.totalPoints);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <Link
        href="/admin/marketplace/orders"
        className="inline-flex items-center gap-2 text-muted-500 hover:text-timber-dark mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Повернутися до замовлень
      </Link>

      <div className="bg-timber-dark text-canvas p-6 mb-6">
        <h1 className="font-syne text-3xl font-bold mb-2">
          Замовлення #{order.orderNumber}
        </h1>
        <p className="text-sm opacity-80">
          {new Date(order.createdAt).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white border border-line rounded-lg p-6">
            <h2 className="font-syne text-xl font-bold mb-4">Клієнт</h2>
            <div className="space-y-2">
              <p>
                <strong>Ім'я:</strong> {order.users.firstName} {order.users.lastName}
              </p>
              <p>
                <strong>Email:</strong> {order.users.email}
              </p>
              {order.users.phone && (
                <p>
                  <strong>Телефон:</strong> {order.users.phone}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-line rounded-lg p-6">
            <h2 className="font-syne text-xl font-bold mb-4">Товари</h2>
            <div className="space-y-3">
              {order.orderItems.map((item: any) => {
                const itemTotal = item.pricePoints * item.quantity;
                const itemUah = pointsToUAH(itemTotal);

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-line/10 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-bold mb-1">{item.productName}</p>
                      <p className="text-sm text-muted-500">
                        {item.pricePoints} балів × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-syne font-bold text-bronze">{itemTotal}</p>
                      <p className="text-xs text-muted-500">≈ {itemUah.toFixed(0)} грн</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Info */}
          {order.requiresShipping && (
            <div className="bg-white border border-line rounded-lg p-6">
              <h2 className="font-syne text-xl font-bold mb-4">Доставка</h2>

              {order.novaPoshtaBranch ? (
                <div>
                  <p className="font-bold mb-2">Нова Пошта</p>
                  <p className="text-sm text-muted-500 mb-1">{order.novaPoshtaCity}</p>
                  <p className="text-sm text-muted-500">{order.novaPoshtaBranch}</p>
                </div>
              ) : order.shippingAddress ? (
                <div>
                  <p className="font-bold mb-2">Доставка за адресою</p>
                  <p className="text-sm">{order.shippingAddress.fullName}</p>
                  <p className="text-sm">{order.shippingAddress.phone}</p>
                  <p className="text-sm">{order.shippingAddress.street}</p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.oblast}
                  </p>
                  {order.shippingAddress.postalCode && (
                    <p className="text-sm">{order.shippingAddress.postalCode}</p>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="bg-white border border-line rounded-lg p-6">
              <h2 className="font-bold mb-2">Коментар клієнта</h2>
              <p className="text-sm text-muted-500">{order.customerNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Management */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="bg-timber-dark text-canvas p-6">
            <h2 className="font-syne text-xl font-bold mb-4">Разом</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="opacity-80">Товарів:</span>
                <span className="font-bold">{order.orderItems.length}</span>
              </div>
              <div className="flex justify-between border-t border-canvas/20 pt-3">
                <span className="opacity-80">Сплачено:</span>
                <div className="text-right">
                  <p className="font-syne font-bold text-bronze">{order.totalPoints}</p>
                  <p className="text-xs opacity-60">≈ {uahValue.toFixed(0)} грн</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white border border-line rounded-lg p-6">
            <h2 className="font-bold mb-4">Управління замовленням</h2>

            {error && (
              <div className="bg-red-50 border border-red-600 p-3 mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Статус</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full border border-line rounded-lg px-3 py-2"
                >
                  <option value="pending">Очікує підтвердження</option>
                  <option value="confirmed">Підтверджено</option>
                  <option value="processing">В обробці</option>
                  <option value="shipped">Відправлено</option>
                  <option value="delivered">Доставлено</option>
                  <option value="cancelled">Скасовано</option>
                  <option value="refunded">Повернуто (з поверненням балів)</option>
                </select>
              </div>

              {order.requiresShipping && (
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Номер відстеження (ТТН)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="20400048622017"
                    className="w-full border border-line rounded-lg px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2">Адмін нотатки</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-line rounded-lg px-3 py-2"
                  placeholder="Внутрішні примітки..."
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-bronze text-canvas px-6 py-3 font-bold hover:bg-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white border border-line rounded-lg p-6">
            <h2 className="font-bold mb-4">Часові мітки</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Створено:</strong>{' '}
                {new Date(order.createdAt).toLocaleString('uk-UA')}
              </p>
              {order.shippedAt && (
                <p>
                  <strong>Відправлено:</strong>{' '}
                  {new Date(order.shippedAt).toLocaleString('uk-UA')}
                </p>
              )}
              {order.deliveredAt && (
                <p className="text-green-600">
                  <strong>Доставлено:</strong>{' '}
                  {new Date(order.deliveredAt).toLocaleString('uk-UA')}
                </p>
              )}
              {order.cancelledAt && (
                <p className="text-red-600">
                  <strong>Скасовано:</strong>{' '}
                  {new Date(order.cancelledAt).toLocaleString('uk-UA')}
                </p>
              )}
              {order.refundedAt && (
                <p className="text-gray-600">
                  <strong>Повернуто:</strong>{' '}
                  {new Date(order.refundedAt).toLocaleString('uk-UA')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
