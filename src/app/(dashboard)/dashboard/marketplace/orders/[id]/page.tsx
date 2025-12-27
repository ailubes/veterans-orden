'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, MapPin } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import type { OrderWithItems, OrderStatus } from '@/lib/marketplace/types';

interface OrderResponse {
  order: OrderWithItems;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/marketplace/orders/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Замовлення не знайдено');
          }
          throw new Error('Failed to fetch order');
        }

        const data: OrderResponse = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="text-yellow-600" size={24} />;
      case 'processing':
      case 'shipped':
        return <Truck className="text-blue-600" size={24} />;
      case 'delivered':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return <Package className="text-timber-beam" size={24} />;
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Очікує підтвердження';
      case 'confirmed':
        return 'Підтверджено';
      case 'processing':
        return 'В обробці';
      case 'shipped':
        return 'Відправлено';
      case 'delivered':
        return 'Доставлено';
      case 'cancelled':
        return 'Скасовано';
      case 'refunded':
        return 'Повернуто';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-timber-beam">Завантаження...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Замовлення не знайдено'}</p>
          <Link
            href="/dashboard/marketplace/orders"
            className="inline-flex items-center gap-2 bg-accent text-canvas px-6 py-3 font-bold hover:bg-accent/90 transition-colors"
          >
            <ArrowLeft size={20} />
            Повернутися до замовлень
          </Link>
        </div>
      </div>
    );
  }

  const uahValue = pointsToUAH(order.totalPoints);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/marketplace/orders"
        className="inline-flex items-center gap-2 text-timber-beam hover:text-timber-dark mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Повернутися до замовлень
      </Link>

      {/* Order Header */}
      <div className="bg-timber-dark text-canvas p-6 mb-6 relative">
        <div className="joint border-accent" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint border-accent" style={{ top: '-6px', right: '-6px' }} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="label text-accent mb-2">ЗАМОВЛЕННЯ</p>
            <h1 className="font-syne text-3xl font-bold mb-2">#{order.orderNumber}</h1>
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

          <div className="flex items-center gap-3 bg-canvas text-timber-dark px-4 py-3">
            {getStatusIcon(order.status)}
            <span className="font-bold">{getStatusLabel(order.status)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-canvas border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />

            <h2 className="font-syne text-xl font-bold mb-4">Товари</h2>

            <div className="space-y-3">
              {order.items.map((item) => {
                const itemTotal = item.pricePoints * item.quantity;
                const itemUah = pointsToUAH(itemTotal);

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-timber-dark/10 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-bold mb-1">{item.productName}</p>
                      <p className="text-sm text-timber-beam">
                        {item.pricePoints} балів × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-syne font-bold text-accent">{itemTotal}</p>
                      <p className="text-xs text-timber-beam">≈ {itemUah.toFixed(0)} грн</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Info */}
          {order.requiresShipping && (
            <div className="bg-canvas border-2 border-timber-dark p-6 relative">
              <div className="joint" style={{ top: '-6px', left: '-6px' }} />
              <div className="joint" style={{ top: '-6px', right: '-6px' }} />

              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-accent" size={20} />
                <h2 className="font-syne text-xl font-bold">Доставка</h2>
              </div>

              {order.novaPoshtaBranch ? (
                <div>
                  <p className="font-bold mb-1">Нова Пошта</p>
                  <p className="text-sm text-timber-beam mb-1">
                    {order.novaPoshtaCity}
                  </p>
                  <p className="text-sm text-timber-beam">{order.novaPoshtaBranch}</p>
                </div>
              ) : order.shippingAddress ? (
                <div>
                  <p className="font-bold mb-1">Доставка за адресою</p>
                  <p className="text-sm text-timber-beam">
                    {order.shippingAddress.street}
                  </p>
                  <p className="text-sm text-timber-beam">
                    {order.shippingAddress.city}, {order.shippingAddress.oblast}
                  </p>
                  {order.shippingAddress.postalCode && (
                    <p className="text-sm text-timber-beam">
                      {order.shippingAddress.postalCode}
                    </p>
                  )}
                </div>
              ) : null}

              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-timber-dark/20">
                  <p className="text-sm font-bold mb-1">Номер відстеження (ТТН)</p>
                  <p className="font-mono text-lg text-accent">{order.trackingNumber}</p>
                </div>
              )}

              {order.shippedAt && (
                <p className="text-sm text-timber-beam mt-2">
                  Відправлено:{' '}
                  {new Date(order.shippedAt).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}

              {order.deliveredAt && (
                <p className="text-sm text-green-600 font-bold mt-2">
                  Доставлено:{' '}
                  {new Date(order.deliveredAt).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          )}

          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="bg-canvas border-2 border-timber-dark p-6 relative">
              <div className="joint" style={{ top: '-6px', left: '-6px' }} />
              <h2 className="font-bold mb-2">Ваш коментар</h2>
              <p className="text-sm text-timber-beam">{order.customerNotes}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-timber-dark text-canvas p-6 relative sticky top-4">
            <div className="joint border-accent" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint border-accent" style={{ top: '-6px', right: '-6px' }} />

            <h2 className="font-syne text-xl font-bold mb-4">Разом</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="opacity-80">Товарів:</span>
                <span className="font-bold">{order.items.length}</span>
              </div>

              <div className="flex justify-between text-xl border-t border-canvas/20 pt-3">
                <span className="opacity-80">Сплачено:</span>
                <div className="text-right">
                  <p className="font-syne font-bold text-accent">{order.totalPoints}</p>
                  <p className="text-xs opacity-60">≈ {uahValue.toFixed(0)} грн</p>
                </div>
              </div>
            </div>

            {order.status === 'pending' && (
              <p className="text-xs opacity-60 text-center">
                Очікуйте підтвердження замовлення від адміністратора
              </p>
            )}

            {order.status === 'confirmed' && (
              <p className="text-xs opacity-60 text-center">
                Замовлення підтверджено. Очікуйте відправку.
              </p>
            )}

            {order.status === 'processing' && (
              <p className="text-xs opacity-60 text-center">
                Ваше замовлення обробляється
              </p>
            )}

            {order.status === 'shipped' && (
              <p className="text-xs opacity-60 text-center">
                Відстежуйте доставку за номером ТТН
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
