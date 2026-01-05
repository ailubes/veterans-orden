'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, Truck, Loader2 } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import type { OrderWithItems, OrderStatus } from '@/lib/marketplace/types';

interface OrdersResponse {
  orders: OrderWithItems[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/marketplace/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data: OrdersResponse = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="text-yellow-400" size={20} />;
      case 'processing':
      case 'shipped':
        return <Truck className="text-blue-400" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <Package className="text-muted-500" size={20} />;
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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'processing':
      case 'shipped':
        return 'text-blue-400 bg-blue-500/10';
      case 'delivered':
        return 'text-green-400 bg-green-500/10';
      case 'cancelled':
      case 'refunded':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-muted-500 bg-panel-850';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="mono text-bronze text-xs tracking-widest mb-2">// ЗАМОВЛЕННЯ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">Мої замовлення</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-bronze" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="mono text-bronze text-xs tracking-widest mb-2">// ЗАМОВЛЕННЯ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">Мої замовлення</h1>
        </div>
        <div className="text-center py-12 bg-red-500/10 border border-red-500 text-red-400 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// ЗАМОВЛЕННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100 mb-4">Мої замовлення</h1>
        <div className="flex gap-4">
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 bg-panel-850 text-text-100 px-4 py-2 font-bold hover:bg-panel-900 transition-colors rounded"
          >
            Перейти до магазину
          </Link>
          <Link
            href="/dashboard/marketplace/checkout"
            className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-4 py-2 font-bold hover:bg-bronze/90 transition-colors rounded"
          >
            Кошик
          </Link>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-panel-900 border border-line rounded-lg">
          <Package className="mx-auto mb-4 text-muted-500" size={48} />
          <p className="text-muted-500 mb-6">У вас ще немає замовлень</p>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-6 py-3 font-bold hover:bg-bronze/90 transition-colors rounded"
          >
            Перейти до магазину
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const uahValue = pointsToUAH(order.totalPoints);

            return (
              <Link
                key={order.id}
                href={`/dashboard/marketplace/orders/${order.id}`}
                className="block bg-panel-900 border border-line p-6 rounded-lg hover:border-bronze/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="font-syne text-xl font-bold text-text-100">
                        Замовлення #{order.orderNumber}
                      </p>
                      <div className={`px-3 py-1 text-xs font-bold flex items-center gap-1 rounded ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-500 mb-3">
                      {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="text-sm bg-panel-850 text-text-200 px-2 py-1 rounded"
                        >
                          {item.productName} × {item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-sm text-muted-500 px-2 py-1">
                          +{order.items.length - 3} ще
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-syne text-2xl font-bold text-bronze mb-1">
                      {order.totalPoints}
                    </p>
                    <p className="text-sm text-muted-500">
                      балів (≈ {uahValue.toFixed(0)} грн)
                    </p>
                    <p className="text-xs text-muted-500 mt-2">
                      {order.items.length} {order.items.length === 1 ? 'товар' : 'товарів'}
                    </p>
                  </div>
                </div>

                {/* Shipping Info */}
                {order.requiresShipping && (
                  <div className="mt-4 pt-4 border-t border-line">
                    <p className="text-sm text-muted-500">
                      {order.novaPoshtaBranch ? (
                        <>
                          <strong className="text-text-200">Доставка:</strong> Нова Пошта,{' '}
                          {order.novaPoshtaCity}, {order.novaPoshtaBranch}
                        </>
                      ) : (
                        <>
                          <strong className="text-text-200">Доставка:</strong> За адресою
                        </>
                      )}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-muted-500 mt-1">
                        <strong className="text-text-200">ТТН:</strong> {order.trackingNumber}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
