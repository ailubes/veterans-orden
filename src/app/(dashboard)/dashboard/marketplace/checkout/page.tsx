'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingCart, CreditCard, MapPin, Loader2, Check } from 'lucide-react';
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
        <div className="bg-green-500/10 border border-green-500 p-8 rounded-lg">
          <Check className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <h2 className="font-syne text-2xl font-bold text-green-400 mb-4">
            Замовлення створено!
          </h2>
          <p className="text-muted-500 mb-4">
            Перенаправляємо вас на сторінку замовлення...
          </p>
          <Loader2 className="animate-spin mx-auto text-green-400" size={32} />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="mono text-bronze text-xs tracking-widest mb-2">// КОШИК</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">Оформлення замовлення</h1>
        </div>

        <div className="text-center py-12 bg-panel-900 border border-line rounded-lg">
          <ShoppingCart className="mx-auto mb-4 text-muted-500" size={48} />
          <p className="text-muted-500 mb-6">Ваш кошик порожній</p>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-6 py-3 font-bold hover:bg-bronze/90 transition-colors rounded"
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
        className="inline-flex items-center gap-2 text-muted-500 hover:text-bronze mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Повернутися до магазину
      </Link>

      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// КОШИК</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">Оформлення замовлення</h1>
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
                className="bg-panel-900 border border-line p-4 rounded-lg"
              >
                <div className="flex gap-4">
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.nameUk}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold text-text-100 mb-1">{item.product.nameUk}</h3>
                    <p className="text-sm text-muted-500 mb-2">
                      {item.product.pricePoints} балів × {item.quantity}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 bg-panel-850 hover:bg-panel-900 font-bold transition-colors text-text-100 rounded"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-bold text-text-100">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 bg-panel-850 hover:bg-panel-900 font-bold transition-colors text-text-100 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-syne text-xl font-bold text-bronze mb-1">{itemTotal}</p>
                    <p className="text-xs text-muted-500 mb-3">≈ {itemUah.toFixed(0)} грн</p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-400 hover:text-red-300 transition-colors"
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
            <div className="bg-panel-900 border border-line p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-bronze" size={20} />
                <h2 className="font-syne text-xl font-bold text-text-100">Доставка</h2>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={shippingMethod === 'novaposhta'}
                    onChange={() => setShippingMethod('novaposhta')}
                    className="w-4 h-4 accent-bronze"
                  />
                  <span className="font-bold text-text-100">Нова Пошта</span>
                </label>

                {shippingMethod === 'novaposhta' && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="block text-sm text-text-200 mb-1">Місто *</label>
                      <input
                        type="text"
                        value={novaPoshtaCity}
                        onChange={(e) => setNovaPoshtaCity(e.target.value)}
                        placeholder="Київ"
                        className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-200 mb-1">Відділення *</label>
                      <input
                        type="text"
                        value={novaPoshtaBranch}
                        onChange={(e) => setNovaPoshtaBranch(e.target.value)}
                        placeholder="Відділення №1"
                        className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={shippingMethod === 'address'}
                    onChange={() => setShippingMethod('address')}
                    className="w-4 h-4 accent-bronze"
                  />
                  <span className="font-bold text-text-100">Кур'єром за адресою</span>
                </label>

                {shippingMethod === 'address' && (
                  <div className="ml-6 mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-text-200 mb-1">Повне ім'я *</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-200 mb-1">Телефон *</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+380..."
                          className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-text-200 mb-1">Вулиця, будинок, квартира *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-text-200 mb-1">Місто *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-200 mb-1">Область *</label>
                        <input
                          type="text"
                          value={oblast}
                          onChange={(e) => setOblast(e.target.value)}
                          className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-200 mb-1">Індекс</label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-panel-900 border border-line p-6 rounded-lg">
            <label className="block font-bold text-text-100 mb-2">Коментар до замовлення</label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Додаткові побажання..."
              rows={3}
              className="w-full border border-line bg-panel-850 px-3 py-2 text-text-100 rounded focus:border-bronze focus:outline-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-bronze text-bg-950 p-6 rounded-lg sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} />
              <h2 className="font-syne text-xl font-bold">Разом</h2>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="opacity-80">Товарів:</span>
                <span className="font-bold">{cart.length}</span>
              </div>
              <div className="flex justify-between text-xl">
                <span className="opacity-80">До сплати:</span>
                <span className="font-syne font-bold">{totalPoints}</span>
              </div>
              <p className="text-sm opacity-70">балів (≈ {totalUah.toFixed(0)} грн)</p>
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600 p-3 mb-4 text-sm text-red-100 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-bg-950 text-bronze px-6 py-4 font-bold hover:bg-bg-950/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded"
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

            <p className="text-xs opacity-70 mt-4 text-center">
              Натискаючи кнопку, ви погоджуєтеся з умовами обміну балів
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
