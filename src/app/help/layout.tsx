import Link from 'next/link';
import { HelpCircle, Home } from 'lucide-react';
import { HelpSearch } from '@/components/help/help-search';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-panel-900">
      {/* Header */}
      <div className="border-b-2 border-line bg-panel-850">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="text-bronze" size={32} />
              <div>
                <h1 className="font-syne text-2xl font-bold">Центр допомоги</h1>
                <p className="text-sm text-muted-500">Все про роботу з платформою</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-bold hover:text-bronze transition-colors"
            >
              <Home size={18} />
              На головну
            </Link>
          </div>

          {/* Search Bar */}
          <HelpSearch placeholder="Пошук статей..." />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
