import Link from 'next/link';

export default function AdminMembersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label text-accent mb-2">АДМІНІСТРУВАННЯ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">
            Члени Мережі
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" disabled>
            ЕКСПОРТ
          </button>
          <button className="btn" disabled>
            + ДОДАТИ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-canvas border-2 border-timber-dark p-4 mb-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Пошук за ім'ям або email..."
              className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              disabled
            />
          </div>
          <select
            className="px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            disabled
          >
            <option>Всі статуси</option>
            <option>Активні</option>
            <option>Неактивні</option>
            <option>Заблоковані</option>
          </select>
          <select
            className="px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            disabled
          >
            <option>Всі плани</option>
            <option>Безкоштовний</option>
            <option>Базовий</option>
            <option>Стандарт</option>
            <option>Преміум</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-canvas border-2 border-timber-dark relative overflow-hidden">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b-2 border-timber-dark bg-timber-dark/5">
          <div className="col-span-4 label">ЧЛЕН</div>
          <div className="col-span-2 label">СТАТУС</div>
          <div className="col-span-2 label">ПЛАН</div>
          <div className="col-span-2 label">ДАТА</div>
          <div className="col-span-2 label text-right">ДІЇ</div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 text-timber-beam">
          <p className="text-sm">Поки що немає членів</p>
          <p className="text-xs mt-2 opacity-60">
            Підключіть базу даних Supabase для відображення членів
          </p>
          <div className="mt-6">
            <Link
              href="https://supabase.com/dashboard"
              target="_blank"
              className="text-accent hover:underline text-sm"
            >
              Відкрити Supabase Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-timber-beam">
          Показано 0 з 0 записів
        </p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border-2 border-timber-dark text-sm font-bold disabled:opacity-50"
            disabled
          >
            ← НАЗАД
          </button>
          <button
            className="px-4 py-2 border-2 border-timber-dark text-sm font-bold disabled:opacity-50"
            disabled
          >
            ДАЛІ →
          </button>
        </div>
      </div>
    </div>
  );
}
