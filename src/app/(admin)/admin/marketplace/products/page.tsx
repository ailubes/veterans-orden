'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Package, Edit, Trash2, Eye, Star } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import type { Product, ProductStatus, ProductType } from '@/lib/marketplace/types';

interface ProductsResponse {
  products: Product[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<ProductType | 'all'>('all');

  useEffect(() => {
    fetchProducts();
  }, [filterStatus, filterType]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterStatus !== 'all') {
        params.set('status', filterStatus);
      }

      if (filterType !== 'all') {
        params.set('type', filterType);
      }

      const response = await fetch(`/api/admin/marketplace/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm('Видалити цей товар?')) return;

    try {
      const response = await fetch(`/api/admin/marketplace/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      const result = await response.json();
      alert(result.message);
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  const getStatusBadge = (status: ProductStatus) => {
    const badges = {
      draft: 'bg-gray-500/10 text-gray-600',
      active: 'bg-green-600/10 text-green-600',
      out_of_stock: 'bg-red-600/10 text-red-600',
      discontinued: 'bg-gray-500/10 text-gray-500',
    };
    const labels = {
      draft: 'Чернетка',
      active: 'Активний',
      out_of_stock: 'Немає в наявності',
      discontinued: 'Припинено',
    };

    return (
      <span className={`px-2 py-1 text-xs font-bold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type: ProductType) => {
    const labels = {
      physical: 'Фізичний',
      digital: 'Цифровий',
      event_ticket: 'Квиток',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-syne text-3xl font-bold">Товари маркетплейсу</h1>
        </div>
        <div className="text-center py-12 text-timber-beam">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-3xl font-bold mb-2">Товари маркетплейсу</h1>
          <p className="text-timber-beam">Управління каталогом товарів</p>
        </div>
        <Link
          href="/admin/marketplace/products/new"
          className="inline-flex items-center gap-2 bg-accent text-canvas px-6 py-3 font-bold hover:bg-accent/90 transition-colors"
        >
          <Plus size={20} />
          Додати товар
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-timber-dark p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border-2 border-timber-dark px-3 py-2 font-bold"
          >
            <option value="all">Всі статуси</option>
            <option value="draft">Чернетки</option>
            <option value="active">Активні</option>
            <option value="out_of_stock">Немає в наявності</option>
            <option value="discontinued">Припинено</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border-2 border-timber-dark px-3 py-2 font-bold"
          >
            <option value="all">Всі типи</option>
            <option value="physical">Фізичні</option>
            <option value="digital">Цифрові</option>
            <option value="event_ticket">Квитки</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {error ? (
        <div className="bg-red-50 border-2 border-red-600 p-4 text-red-600">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-timber-dark">
          <Package className="mx-auto mb-4 text-timber-beam" size={48} />
          <p className="text-timber-beam mb-6">Немає товарів</p>
          <Link
            href="/admin/marketplace/products/new"
            className="inline-flex items-center gap-2 bg-accent text-canvas px-6 py-3 font-bold hover:bg-accent/90 transition-colors"
          >
            <Plus size={20} />
            Додати перший товар
          </Link>
        </div>
      ) : (
        <div className="bg-white border-2 border-timber-dark overflow-hidden">
          <table className="w-full">
            <thead className="bg-timber-dark text-canvas">
              <tr>
                <th className="text-left p-4 font-bold">Товар</th>
                <th className="text-left p-4 font-bold">Тип</th>
                <th className="text-left p-4 font-bold">Статус</th>
                <th className="text-left p-4 font-bold">Ціна</th>
                <th className="text-left p-4 font-bold">Запас</th>
                <th className="text-right p-4 font-bold">Дії</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const uahValue = pointsToUAH(product.pricePoints);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-timber-dark/10 last:border-0 hover:bg-timber-dark/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.nameUk}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-timber-dark/10 flex items-center justify-center">
                            <Package size={20} className="text-timber-beam" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{product.nameUk}</p>
                          <p className="text-xs text-timber-beam">{product.slug}</p>
                          {product.featured && (
                            <Star size={14} className="text-accent fill-accent inline mt-1" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{getTypeLabel(product.type)}</span>
                    </td>
                    <td className="p-4">{getStatusBadge(product.status)}</td>
                    <td className="p-4">
                      <p className="font-syne font-bold text-accent">
                        {product.pricePoints}
                      </p>
                      <p className="text-xs text-timber-beam">≈ {uahValue.toFixed(0)} грн</p>
                    </td>
                    <td className="p-4">
                      {product.stockQuantity !== null ? (
                        <span className="text-sm">{product.stockQuantity} шт.</span>
                      ) : (
                        <span className="text-sm text-timber-beam">Необмежено</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/marketplace/${product.slug}`}
                          target="_blank"
                          className="p-2 hover:bg-timber-dark/10 transition-colors"
                          title="Переглянути"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/marketplace/products/${product.id}/edit`}
                          className="p-2 hover:bg-timber-dark/10 transition-colors"
                          title="Редагувати"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                          title="Видалити"
                        >
                          <Trash2 size={18} />
                        </button>
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
