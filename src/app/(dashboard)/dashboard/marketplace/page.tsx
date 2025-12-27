'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, Download, Ticket, Star, Filter } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import type { Product, ProductType } from '@/lib/marketplace/types';

// Helper function to strip HTML tags from text
function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ProductType | 'all'>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (filterType !== 'all') {
          params.set('type', filterType);
        }

        if (showFeaturedOnly) {
          params.set('featured', 'true');
        }

        const response = await fetch(`/api/marketplace/products?${params}`);
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

    fetchProducts();
  }, [filterType, showFeaturedOnly]);

  const getProductIcon = (type: ProductType) => {
    switch (type) {
      case 'physical':
        return <Package size={20} className="text-accent" />;
      case 'digital':
        return <Download size={20} className="text-accent" />;
      case 'event_ticket':
        return <Ticket size={20} className="text-accent" />;
    }
  };

  const getProductTypeLabel = (type: ProductType) => {
    switch (type) {
      case 'physical':
        return 'Фізичний товар';
      case 'digital':
        return 'Цифровий товар';
      case 'event_ticket':
        return 'Квиток на подію';
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="label mb-2">МАГАЗИН</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">Маркетплейс</h1>
        </div>
        <div className="text-center py-12 text-timber-beam">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="label mb-2">МАГАЗИН</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">Маркетплейс</h1>
        </div>
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">МАГАЗИН</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold mb-4">Маркетплейс</h1>
        <p className="text-timber-beam">
          Обмінюйте бали на товари, цифрові продукти та квитки на події
        </p>
      </div>

      {/* Filters */}
      <div className="bg-canvas border-2 border-timber-dark p-4 mb-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-accent" size={20} />
          <p className="font-bold">Фільтри</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 font-bold text-sm transition-colors ${
              filterType === 'all'
                ? 'bg-accent text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            Усі товари
          </button>
          <button
            onClick={() => setFilterType('physical')}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              filterType === 'physical'
                ? 'bg-accent text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            <Package size={16} />
            Фізичні товари
          </button>
          <button
            onClick={() => setFilterType('digital')}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              filterType === 'digital'
                ? 'bg-accent text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            <Download size={16} />
            Цифрові
          </button>
          <button
            onClick={() => setFilterType('event_ticket')}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              filterType === 'event_ticket'
                ? 'bg-accent text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            <Ticket size={16} />
            Квитки
          </button>
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              showFeaturedOnly
                ? 'bg-accent text-canvas'
                : 'bg-timber-dark/10 hover:bg-timber-dark/20'
            }`}
          >
            <Star size={16} />
            Рекомендовані
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-canvas border-2 border-timber-dark relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <ShoppingBag className="mx-auto mb-4 text-timber-beam" size={48} />
          <p className="text-timber-beam">Немає товарів за обраними фільтрами</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const uahValue = pointsToUAH(product.pricePoints);
            const isOutOfStock =
              product.stockQuantity != null && product.stockQuantity <= 0;

            return (
              <Link
                key={product.id}
                href={`/dashboard/marketplace/${product.slug}`}
                className="bg-canvas border-2 border-timber-dark relative hover:border-accent transition-colors group"
              >
                <div className="joint" style={{ top: '-6px', left: '-6px' }} />
                <div className="joint" style={{ top: '-6px', right: '-6px' }} />
                <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
                <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

                {/* Image */}
                {product.imageUrl ? (
                  <div className="aspect-square bg-timber-dark/5 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.nameUk}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-timber-dark/5 flex items-center justify-center">
                    {getProductIcon(product.type)}
                  </div>
                )}

                <div className="p-4">
                  {/* Type & Featured Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-timber-beam flex items-center gap-1">
                      {getProductIcon(product.type)}
                      {getProductTypeLabel(product.type)}
                    </span>
                    {product.featured && (
                      <Star size={14} className="text-accent fill-accent" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-syne font-bold text-lg mb-2 line-clamp-2">
                    {product.nameUk}
                  </h3>

                  {/* Description */}
                  {product.descriptionUk && (
                    <p className="text-sm text-timber-beam mb-3 line-clamp-2">
                      {stripHtml(product.descriptionUk)}
                    </p>
                  )}

                  {/* Price & Stock */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-syne text-2xl font-bold text-accent">
                        {product.pricePoints}
                      </p>
                      <p className="text-xs text-timber-beam">
                        балів (≈ {uahValue.toFixed(0)} грн)
                      </p>
                    </div>

                    {isOutOfStock ? (
                      <span className="text-xs font-bold text-red-600 bg-red-600/10 px-2 py-1">
                        Немає в наявності
                      </span>
                    ) : product.stockQuantity !== null ? (
                      <span className="text-xs text-timber-beam">
                        Залишилось: {product.stockQuantity}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
