import Link from 'next/link';
import { Package, ShoppingCart } from 'lucide-react';

export default function AdminMarketplacePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold mb-2">Управління магазином</h1>
        <p className="text-timber-beam">
          Керуйте товарами маркетплейсу та замовленнями користувачів
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Card */}
        <Link
          href="/admin/marketplace/products"
          className="bg-white border-2 border-timber-dark p-8 hover:border-accent transition-colors group"
        >
          <div className="flex items-start gap-4">
            <div className="p-4 bg-timber-dark/10 group-hover:bg-accent/10 transition-colors">
              <Package size={32} className="text-timber-dark group-hover:text-accent transition-colors" />
            </div>
            <div className="flex-1">
              <h2 className="font-syne text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                Товари
              </h2>
              <p className="text-timber-beam mb-4">
                Додавайте та редагуйте товари маркетплейсу. Керуйте цінами, запасами та доступністю.
              </p>
              <div className="font-bold text-accent">
                Перейти до товарів →
              </div>
            </div>
          </div>
        </Link>

        {/* Orders Card */}
        <Link
          href="/admin/marketplace/orders"
          className="bg-white border-2 border-timber-dark p-8 hover:border-accent transition-colors group"
        >
          <div className="flex items-start gap-4">
            <div className="p-4 bg-timber-dark/10 group-hover:bg-accent/10 transition-colors">
              <ShoppingCart size={32} className="text-timber-dark group-hover:text-accent transition-colors" />
            </div>
            <div className="flex-1">
              <h2 className="font-syne text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                Замовлення
              </h2>
              <p className="text-timber-beam mb-4">
                Переглядайте та обробляйте замовлення користувачів. Керуйте статусами та відстеженням доставки.
              </p>
              <div className="font-bold text-accent">
                Перейти до замовлень →
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-timber-dark/5 border-2 border-timber-dark/20 p-6">
        <h3 className="font-syne text-lg font-bold mb-3">Швидкі підказки</h3>
        <ul className="space-y-2 text-sm text-timber-beam">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span>
              Товари з типом "Фізичний" автоматично вимагають адресу доставки або відділення Нової Пошти
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span>
              Цифрові товари можна купити без доставки, посилання на завантаження надсилається автоматично
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span>
              Квитки на події автоматично створюють RSVP з підтвердженням участі
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span>
              При повернені замовлення (статус "Повернуто") бали автоматично повертаються користувачу
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
