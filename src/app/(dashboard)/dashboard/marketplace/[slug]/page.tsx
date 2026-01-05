'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Download, Ticket, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import type { Product, ProductType } from '@/lib/marketplace/types';

interface ProductResponse {
  product: Product;
  userPurchaseCount: number;
  canPurchase: boolean;
  remainingQuantity: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [userPurchaseCount, setUserPurchaseCount] = useState(0);
  const [canPurchase, setCanPurchase] = useState(true);
  const [remainingQuantity, setRemainingQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    // Guard against undefined slug during initial render
    if (!slug) return;

    async function fetchProduct() {
      try {
        const response = await fetch(`/api/marketplace/products/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Товар не знайдено');
          }
          throw new Error('Failed to fetch product');
        }

        const data: ProductResponse = await response.json();
        setProduct(data.product);
        setUserPurchaseCount(data.userPurchaseCount);
        setCanPurchase(data.canPurchase);
        setRemainingQuantity(data.remainingQuantity);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    // Get existing cart
    const cart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: any) => item.productId === product.id);

    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({
        productId: product.id,
        quantity,
        product: {
          id: product.id,
          nameUk: product.nameUk,
          pricePoints: product.pricePoints,
          imageUrl: product.imageUrl,
          type: product.type,
          requiresShipping: product.requiresShipping,
        },
      });
    }

    localStorage.setItem('marketplace_cart', JSON.stringify(cart));
    setAddedToCart(true);

    // Reset after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getProductIcon = (type: ProductType) => {
    switch (type) {
      case 'physical':
        return <Package size={24} className="text-bronze" />;
      case 'digital':
        return <Download size={24} className="text-bronze" />;
      case 'event_ticket':
        return <Ticket size={24} className="text-bronze" />;
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-bronze" size={32} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 bg-panel-900 border border-line rounded-lg">
          <p className="text-red-400 mb-4">{error || 'Товар не знайдено'}</p>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-6 py-3 font-bold hover:bg-bronze/90 transition-colors rounded"
          >
            <ArrowLeft size={20} />
            Повернутися до магазину
          </Link>
        </div>
      </div>
    );
  }

  const uahValue = pointsToUAH(product.pricePoints);
  const isOutOfStock = product.stockQuantity != null && product.stockQuantity <= 0;
  const maxQuantityAllowed = Math.min(
    remainingQuantity,
    product.stockQuantity || Infinity
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-2 text-muted-500 hover:text-bronze mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Повернутися до магазину
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-panel-900 border border-line rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.nameUk}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center bg-panel-850">
              {getProductIcon(product.type)}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {getProductIcon(product.type)}
            <span className="text-sm text-muted-500">
              {getProductTypeLabel(product.type)}
            </span>
          </div>

          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100 mb-4">
            {product.nameUk}
          </h1>

          {product.descriptionUk && (
            <div
              className="text-muted-500 mb-6 prose prose-sm prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.descriptionUk }}
            />
          )}

          {/* Price */}
          <div className="bg-bronze text-bg-950 p-6 mb-6 rounded-lg">
            <p className="text-xs font-bold tracking-widest mb-2 opacity-70">ЦІНА</p>
            <p className="font-syne text-4xl font-bold">{product.pricePoints}</p>
            <p className="text-sm opacity-80">балів (≈ {uahValue.toFixed(0)} грн)</p>
          </div>

          {/* Stock Info */}
          {product.stockQuantity !== null && (
            <div className="mb-4">
              {isOutOfStock ? (
                <p className="text-red-400 font-bold">Немає в наявності</p>
              ) : (
                <p className="text-sm text-muted-500">
                  В наявності: {product.stockQuantity} шт.
                </p>
              )}
            </div>
          )}

          {/* User Purchase Info */}
          {userPurchaseCount > 0 && (
            <div className="mb-4 p-3 bg-bronze/10 border border-bronze rounded">
              <p className="text-sm text-text-200">
                Ви вже придбали: {userPurchaseCount} з {product.maxPerUser} дозволених
              </p>
              {!canPurchase && (
                <p className="text-sm text-red-400 font-bold mt-1">
                  Досягнуто максимальну кількість покупок
                </p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          {canPurchase && !isOutOfStock && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-text-100 mb-2">Кількість</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-panel-850 hover:bg-panel-900 font-bold text-lg transition-colors text-text-100 rounded"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantityAllowed}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(maxQuantityAllowed, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-20 text-center border border-line bg-panel-850 px-3 py-2 font-bold text-text-100 rounded"
                />
                <button
                  onClick={() => setQuantity(Math.min(maxQuantityAllowed, quantity + 1))}
                  className="w-10 h-10 bg-panel-850 hover:bg-panel-900 font-bold text-lg transition-colors text-text-100 rounded"
                  disabled={quantity >= maxQuantityAllowed}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-muted-500 mt-1">
                Максимум: {maxQuantityAllowed} шт.
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          {canPurchase && !isOutOfStock ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-bronze text-bg-950 px-6 py-4 font-bold text-lg hover:bg-bronze/90 transition-colors flex items-center justify-center gap-2 rounded"
            >
              {addedToCart ? (
                <>
                  <Check size={24} />
                  Додано до кошика!
                </>
              ) : (
                <>
                  <ShoppingCart size={24} />
                  Додати до кошика
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-panel-850 text-muted-500 px-6 py-4 font-bold text-lg cursor-not-allowed rounded"
            >
              {isOutOfStock ? 'Немає в наявності' : 'Недоступно для покупки'}
            </button>
          )}

          {/* Additional Info */}
          {product.requiresShipping && (
            <div className="mt-6 p-4 bg-panel-850 rounded">
              <p className="text-sm text-text-200">
                <strong className="text-text-100">Доставка:</strong> Новою Поштою або за вказаною адресою
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
