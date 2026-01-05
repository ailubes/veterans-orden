'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle, Home, ChevronRight } from 'lucide-react';
import { HelpSearch } from '@/components/help/help-search';
import type { HelpCategory } from '@/lib/help/types';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/help/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-panel-900">
      {/* Header */}
      <div className="border-b-2 border-line bg-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-line rounded-lg p-4 sticky top-4">
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />

              <h2 className="font-syne font-bold mb-4 pb-2 border-b-2 border-line/20">
                Категорії
              </h2>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-timber-dark/10 animate-pulse" />
                  ))}
                </div>
              ) : (
                <nav className="space-y-1">
                  <Link
                    href="/help"
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm font-bold transition-all rounded ${
                      pathname === '/help'
                        ? 'bg-bronze text-canvas border border-line rounded-lg shadow-[3px_3px_0px_0px_rgba(44,40,36,1)]'
                        : 'hover:bg-timber-dark/10 hover:translate-x-0.5'
                    }`}
                  >
                    <Home size={16} className={pathname === '/help' ? 'text-canvas' : 'text-bronze'} />
                    Головна
                  </Link>

                  {categories.map((category) => {
                    const Icon = getIconComponent(category.icon);
                    const isActive = pathname.startsWith(`/help/${category.slug}`);

                    return (
                      <div key={category.id}>
                        <Link
                          href={`/help/${category.slug}`}
                          className={`flex items-center gap-2 px-3 py-2.5 text-sm font-bold transition-all rounded ${
                            isActive
                              ? 'bg-bronze text-canvas border border-line rounded-lg shadow-[3px_3px_0px_0px_rgba(44,40,36,1)]'
                              : 'hover:bg-timber-dark/10 hover:translate-x-0.5'
                          }`}
                        >
                          {Icon && <Icon size={16} className={isActive ? 'text-canvas' : 'text-bronze'} />}
                          {category.nameUk}
                        </Link>

                        {/* Subcategories */}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1">
                            {category.subcategories.map((sub) => {
                              const SubIcon = getIconComponent(sub.icon);
                              const isSubActive = pathname.startsWith(`/help/${sub.slug}`);

                              return (
                                <Link
                                  key={sub.id}
                                  href={`/help/${sub.slug}`}
                                  className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-all rounded ${
                                    isSubActive
                                      ? 'bg-bronze text-canvas border border-line shadow-[2px_2px_0px_0px_rgba(44,40,36,1)]'
                                      : 'hover:bg-timber-dark/10 hover:translate-x-0.5'
                                  }`}
                                >
                                  <ChevronRight size={12} className={isSubActive ? 'text-canvas' : 'text-muted-500'} />
                                  {SubIcon && <SubIcon size={12} className={isSubActive ? 'text-canvas' : 'text-bronze'} />}
                                  {sub.nameUk}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// Helper to get Lucide icon component by name
function getIconComponent(iconName: string | null) {
  if (!iconName) return null;

  // Dynamically import icons - add more as needed
  const icons: Record<string, any> = {
    Rocket: require('lucide-react').Rocket,
    Zap: require('lucide-react').Zap,
    HelpCircle: require('lucide-react').HelpCircle,
    Shield: require('lucide-react').Shield,
    Video: require('lucide-react').Video,
    Settings: require('lucide-react').Settings,
    Book: require('lucide-react').Book,
    Users: require('lucide-react').Users,
    Calendar: require('lucide-react').Calendar,
    Vote: require('lucide-react').Vote,
    CheckSquare: require('lucide-react').CheckSquare,
    ShoppingBag: require('lucide-react').ShoppingBag,
    Coins: require('lucide-react').Coins,
    Bell: require('lucide-react').Bell,
    Target: require('lucide-react').Target,
    Trophy: require('lucide-react').Trophy,
    Award: require('lucide-react').Award,
  };

  return icons[iconName] || null;
}
