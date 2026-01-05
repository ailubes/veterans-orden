'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, Download, Ticket, Star, Filter, Loader2 } from 'lucide-react';
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
        return <Package size={20} className="text-bronze" />;
      case 'digital':
        return <Download size={20} className="text-bronze" />;
      case 'event_ticket':
        return <Ticket size={20} className="text-bronze" />;
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
          <p className="mono text-bronze text-xs tracking-widest mb-2">// МАГАЗИН</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">Маркетплейс</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-bronze" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="mono text-bronze text-xs tracking-widest mb-2">// МАГАЗИН</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">Маркетплейс</h1>
        </div>
        <div className="text-center py-12 bg-red-500/10 border border-red-500 text-red-400 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// МАГАЗИН</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100 mb-4">Маркетплейс</h1>
        <p className="text-muted-500">
          Обмінюйте бали на товари, цифрові продукти та квитки на події
        </p>
      </div>

      {/* Filters */}
      <div className="bg-panel-900 border border-line p-4 mb-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-bronze" size={20} />
          <p className="font-bold text-text-100">Фільтри</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 font-bold text-sm transition-colors rounded ${
              filterType === 'all'
                ? 'bg-bronze text-bg-950'
                : 'bg-panel-850 hover:bg-panel-850/80 text-text-200'
            }`}
          >
            Усі товари
          </button>
          <button
            onClick={() => setFilterType('physical')}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 rounded ${
              filterType === 'physical'
                ? 'bg-bronze text-bg-950'
                : 'bg-panel-850 hover:bg-panel-850/80 text-text-200'
            }`}
          >
            <Package size={16} />
            Фізичні товари
          </button>
          <button
            onClick={() => setFilterType('digital')}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 rounded ${
              filterType === 'digital'
                ? 'bg-bronze text-bg-950'
                : 'bg-panel-850 hover:bg-panel-850/80 text-text-200'
            }`}
          >
            <Download size={16} />
            Цифрові
          </button>
          <button
            onClick={() => setFilterType('event_ticket')}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 rounded ${
              filterType === 'event_ticket'
                ? 'bg-bronze text-bg-950'
                : 'bg-panel-850 hover:bg-panel-850/80 text-text-200'
            }`}
          >
            <Ticket size={16} />
            Квитки
          </button>
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 rounded ${
              showFeaturedOnly
                ? 'bg-bronze text-bg-950'
                : 'bg-panel-850 hover:bg-panel-850/80 text-text-200'
            }`}
          >
            <Star size={16} />
            Рекомендовані
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-panel-900 border border-line rounded-lg">
          <ShoppingBag className="mx-auto mb-4 text-muted-500" size={48} />
          <p className="text-muted-500">Немає товарів за обраними фільтрами</p>
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
                className="bg-panel-900 border border-line rounded-lg overflow-hidden hover:border-bronze/50 transition-colors group"
              >
                {/* Image */}
                {product.imageUrl ? (
                  <div className="aspect-square bg-panel-850 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.nameUk}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-panel-850 flex items-center justify-center">
                    {getProductIcon(product.type)}
                  </div>
                )}

                <div className="p-4">
                  {/* Type & Featured Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-500 flex items-center gap-1">
                      {getProductIcon(product.type)}
                      {getProductTypeLabel(product.type)}
                    </span>
                    {product.featured && (
                      <Star size={14} className="text-bronze fill-bronze" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-syne font-bold text-lg text-text-100 mb-2 line-clamp-2">
                    {product.nameUk}
                  </h3>

                  {/* Description */}
                  {product.descriptionUk && (
                    <p className="text-sm text-muted-500 mb-3 line-clamp-2">
                      {stripHtml(product.descriptionUk)}
                    </p>
                  )}

                  {/* Price & Stock */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-syne text-2xl font-bold text-bronze">
                        {product.pricePoints}
                      </p>
                      <p className="text-xs text-muted-500">
                        балів (≈ {uahValue.toFixed(0)} грн)
                      </p>
                    </div>

                    {isOutOfStock ? (
                      <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        Немає в наявності
                      </span>
                    ) : product.stockQuantity !== null ? (
                      <span className="text-xs text-muted-500">
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
