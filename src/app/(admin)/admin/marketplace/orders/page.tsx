'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import type { OrderWithItems, OrderStatus } from '@/lib/marketplace/types';

interface OrdersResponse {
  orders: (OrderWithItems & {
    users: {
      first_name: string;
      last_name: string;
      email: string;
    };
  })[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterStatus !== 'all') {
        params.set('status', filterStatus);
      }

      const response = await fetch(`/api/admin/marketplace/orders?${params}`);
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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="text-yellow-600" size={18} />;
      case 'processing':
      case 'shipped':
        return <Truck className="text-blue-600" size={18} />;
      case 'delivered':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="text-red-600" size={18} />;
      default:
        return <Package className="text-muted-500" size={18} />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const badges = {
      pending: 'bg-yellow-600/10 text-yellow-600',
      confirmed: 'bg-green-600/10 text-green-600',
      processing: 'bg-blue-600/10 text-blue-600',
      shipped: 'bg-blue-700/10 text-blue-700',
      delivered: 'bg-green-700/10 text-green-700',
      cancelled: 'bg-red-600/10 text-red-600',
      refunded: 'bg-gray-600/10 text-gray-600',
    };

    const labels = {
      pending: 'Очікує',
      confirmed: 'Підтверджено',
      processing: 'В обробці',
      shipped: 'Відправлено',
      delivered: 'Доставлено',
      cancelled: 'Скасовано',
      refunded: 'Повернуто',
    };

    return (
      <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${badges[status]}`}>
        {getStatusIcon(status)}
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-syne text-3xl font-bold">Замовлення</h1>
        </div>
        <div className="text-center py-12 text-muted-500">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold mb-2">Замовлення</h1>
        <p className="text-muted-500">Управління замовленнями маркетплейсу</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${
              filterStatus === 'all'
                ? 'bg-bronze text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            Всі
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${
              filterStatus === 'pending'
                ? 'bg-bronze text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            Очікують
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${
              filterStatus === 'confirmed'
                ? 'bg-bronze text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            Підтверджені
          </button>
          <button
            onClick={() => setFilterStatus('processing')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${
              filterStatus === 'processing'
                ? 'bg-bronze text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            В обробці
          </button>
          <button
            onClick={() => setFilterStatus('shipped')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${
              filterStatus === 'shipped'
                ? 'bg-bronze text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            Відправлені
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${
              filterStatus === 'delivered'
                ? 'bg-bronze text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            Доставлені
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {error ? (
        <div className="bg-red-50 border-2 border-red-600 p-4 text-red-600">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-line rounded-lg">
          <Package className="mx-auto mb-4 text-muted-500" size={48} />
          <p className="text-muted-500">Немає замовлень</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-timber-dark text-canvas">
              <tr>
                <th className="text-left p-4 font-bold">Номер</th>
                <th className="text-left p-4 font-bold">Клієнт</th>
                <th className="text-left p-4 font-bold">Товарів</th>
                <th className="text-left p-4 font-bold">Сума</th>
                <th className="text-left p-4 font-bold">Статус</th>
                <th className="text-left p-4 font-bold">Дата</th>
                <th className="text-right p-4 font-bold">Дії</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const uahValue = pointsToUAH(order.total_points);

                return (
                  <tr
                    key={order.id}
                    className="border-b border-line/10 last:border-0 hover:bg-timber-dark/5"
                  >
                    <td className="p-4">
                      <p className="font-mono font-bold text-sm">{order.order_number}</p>
                      {order.tracking_number && (
                        <p className="text-xs text-muted-500 mt-1">
                          ТТН: {order.tracking_number}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold">
                        {order.users.first_name} {order.users.last_name}
                      </p>
                      <p className="text-xs text-muted-500">{order.users.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{order.order_items?.length || 0} шт.</span>
                    </td>
                    <td className="p-4">
                      <p className="font-syne font-bold text-bronze">{order.total_points}</p>
                      <p className="text-xs text-muted-500">≈ {uahValue.toFixed(0)} грн</p>
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4">
                      <p className="text-sm">
                        {new Date(order.created_at).toLocaleDateString('uk-UA', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-muted-500">
                        {new Date(order.created_at).toLocaleTimeString('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/marketplace/orders/${order.id}`}
                          className="p-2 hover:bg-timber-dark/10 transition-colors inline-flex items-center gap-1 font-bold text-sm"
                        >
                          <Eye size={18} />
                          Деталі
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
