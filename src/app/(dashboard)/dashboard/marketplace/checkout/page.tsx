'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingCart, CreditCard, MapPin, Loader2 } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    nameUk: string;
    pricePoints: number;
    imageUrl?: string;
    type: string;
    requiresShipping: boolean;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Shipping form state
  const [shippingMethod, setShippingMethod] = useState<'novaposhta' | 'address'>('novaposhta');
  const [novaPoshtaCity, setNovaPoshtaCity] = useState('');
  const [novaPoshtaBranch, setNovaPoshtaBranch] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [oblast, setOblast] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
    setCart(storedCart);
  }, []);

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('marketplace_cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('marketplace_cart', JSON.stringify(updatedCart));
  };

  const totalPoints = cart.reduce(
    (sum, item) => sum + item.product.pricePoints * item.quantity,
    0
  );
  const totalUah = pointsToUAH(totalPoints);
  const requiresShipping = cart.some((item) => item.product.requiresShipping);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate shipping info if required
      if (requiresShipping) {
        if (shippingMethod === 'novaposhta') {
          if (!novaPoshtaCity || !novaPoshtaBranch) {
            throw new Error('Будь ласка, оберіть місто та відділення Нової Пошти');
          }
        } else {
          if (!fullName || !phone || !street || !city || !oblast) {
            throw new Error('Будь ласка, заповніть всі обов\'язкові поля адреси');
          }
        }
      }

      // Prepare checkout data
      const checkoutData: any = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customerNotes,
      };

      if (requiresShipping) {
        if (shippingMethod === 'novaposhta') {
          checkoutData.novaPoshtaCity = novaPoshtaCity;
          checkoutData.novaPoshtaBranch = novaPoshtaBranch;
        } else {
          checkoutData.shippingAddress = {
            fullName,
            phone,
            street,
            city,
            oblast,
            postalCode,
          };
        }
      }

      // Submit checkout
      const response = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Не вдалося створити замовлення');
      }

      const result = await response.json();

      // Clear cart
      localStorage.removeItem('marketplace_cart');
      setSuccess(true);

      // Redirect to order page after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/marketplace/orders/${result.order.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-green-50 border-2 border-green-600 p-8 relative">
          <div className="joint border-green-600" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint border-green-600" style={{ top: '-6px', right: '-6px' }} />
          <h2 className="font-syne text-2xl font-bold text-green-600 mb-4">
            Замовлення створено!
          </h2>
          <p className="text-timber-beam mb-4">
            Перенаправляємо вас на сторінку замовлення...
          </p>
          <Loader2 className="animate-spin mx-auto text-green-600" size={32} />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="label mb-2">КОШИК</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">Оформлення замовлення</h1>
        </div>

        <div className="text-center py-12 bg-canvas border-2 border-timber-dark relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <ShoppingCart className="mx-auto mb-4 text-timber-beam" size={48} />
          <p className="text-timber-beam mb-6">Ваш кошик порожній</p>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 bg-accent text-canvas px-6 py-3 font-bold hover:bg-accent/90 transition-colors"
          >
            Перейти до магазину
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-2 text-timber-beam hover:text-timber-dark mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Повернутися до магазину
      </Link>

      <div className="mb-8">
        <p className="label mb-2">КОШИК</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">Оформлення замовлення</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const itemTotal = item.product.pricePoints * item.quantity;
            const itemUah = pointsToUAH(itemTotal);

            return (
              <div
                key={item.productId}
                className="bg-canvas border-2 border-timber-dark p-4 relative"
              >
                <div className="joint" style={{ top: '-6px', left: '-6px' }} />
                <div className="joint" style={{ top: '-6px', right: '-6px' }} />

                <div className="flex gap-4">
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.nameUk}
                      className="w-20 h-20 object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{item.product.nameUk}</h3>
                    <p className="text-sm text-timber-beam mb-2">
                      {item.product.pricePoints} балів × {item.quantity}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 bg-timber-dark/10 hover:bg-timber-dark/20 font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 bg-timber-dark/10 hover:bg-timber-dark/20 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-syne text-xl font-bold text-accent mb-1">{itemTotal}</p>
                    <p className="text-xs text-timber-beam mb-3">≈ {itemUah.toFixed(0)} грн</p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Shipping Form */}
          {requiresShipping && (
            <div className="bg-canvas border-2 border-timber-dark p-6 relative">
              <div className="joint" style={{ top: '-6px', left: '-6px' }} />
              <div className="joint" style={{ top: '-6px', right: '-6px' }} />

              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-accent" size={20} />
                <h2 className="font-syne text-xl font-bold">Доставка</h2>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    checked={shippingMethod === 'novaposhta'}
                    onChange={() => setShippingMethod('novaposhta')}
                    className="w-4 h-4"
                  />
                  <span className="font-bold">Нова Пошта</span>
                </label>

                {shippingMethod === 'novaposhta' && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Місто *</label>
                      <input
                        type="text"
                        value={novaPoshtaCity}
                        onChange={(e) => setNovaPoshtaCity(e.target.value)}
                        placeholder="Київ"
                        className="w-full border-2 border-timber-dark px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Відділення *</label>
                      <input
                        type="text"
                        value={novaPoshtaBranch}
                        onChange={(e) => setNovaPoshtaBranch(e.target.value)}
                        placeholder="Відділення №1"
                        className="w-full border-2 border-timber-dark px-3 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={shippingMethod === 'address'}
                    onChange={() => setShippingMethod('address')}
                    className="w-4 h-4"
                  />
                  <span className="font-bold">Кур'єром за адресою</span>
                </label>

                {shippingMethod === 'address' && (
                  <div className="ml-6 mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm mb-1">Повне ім'я *</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full border-2 border-timber-dark px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Телефон *</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+380..."
                          className="w-full border-2 border-timber-dark px-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Вулиця, будинок, квартира *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full border-2 border-timber-dark px-3 py-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm mb-1">Місто *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full border-2 border-timber-dark px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Область *</label>
                        <input
                          type="text"
                          value={oblast}
                          onChange={(e) => setOblast(e.target.value)}
                          className="w-full border-2 border-timber-dark px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Індекс</label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full border-2 border-timber-dark px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-canvas border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <label className="block font-bold mb-2">Коментар до замовлення</label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Додаткові побажання..."
              rows={3}
              className="w-full border-2 border-timber-dark px-3 py-2"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-timber-dark text-canvas p-6 relative sticky top-4">
            <div className="joint border-accent" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint border-accent" style={{ top: '-6px', right: '-6px' }} />

            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-accent" size={20} />
              <h2 className="font-syne text-xl font-bold">Разом</h2>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="opacity-80">Товарів:</span>
                <span className="font-bold">{cart.length}</span>
              </div>
              <div className="flex justify-between text-xl">
                <span className="opacity-80">До сплати:</span>
                <span className="font-syne font-bold text-accent">{totalPoints}</span>
              </div>
              <p className="text-sm opacity-60">балів (≈ {totalUah.toFixed(0)} грн)</p>
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600 p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-accent text-timber-dark px-6 py-4 font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Обробка...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Оформити замовлення
                </>
              )}
            </button>

            <p className="text-xs opacity-60 mt-4 text-center">
              Натискаючи кнопку, ви погоджуєтеся з умовами обміну балів
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
