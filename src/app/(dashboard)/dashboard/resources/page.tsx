import Link from 'next/link';
import { Briefcase, Scale, Heart, Activity } from 'lucide-react';

const RESOURCE_CATEGORIES = [
  {
    slug: 'jobs',
    label: 'Зайнятість',
    description: 'Вакансії для ветеранів, програми перекваліфікації та підтримка у запуску власного бізнесу.',
    icon: Briefcase,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    accent: 'border-blue-500',
  },
  {
    slug: 'legal',
    label: 'Правова допомога',
    description: 'Безоплатні юридичні консультації, захист прав ветеранів, пільги та соціальний захист.',
    icon: Scale,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
    accent: 'border-purple-500',
  },
  {
    slug: 'support',
    label: 'Психологічна підтримка',
    description: 'Кризові лінії, центри психологічної допомоги, групова та індивідуальна терапія для ветеранів.',
    icon: Heart,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
    accent: 'border-rose-500',
  },
  {
    slug: 'healthcare',
    label: 'Охорона здоров\'я',
    description: 'Реабілітаційні центри, програми протезування, санаторне лікування та медичні програми.',
    icon: Activity,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
    accent: 'border-green-500',
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// РЕСУРСИ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
          Ресурси для ветеранів
        </h1>
        <p className="text-muted-500 text-sm mt-3 max-w-2xl">
          Орден Ветеранів підтримує ваш перехід до цивільного життя. Тут зібрані перевірені організації
          та програми, які допоможуть з роботою, правовими питаннями, психологічною підтримкою та охороною здоров'я.
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {RESOURCE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/dashboard/resources/${cat.slug}`}
              className={`group border rounded-lg p-6 transition-all hover:scale-[1.01] hover:shadow-lg ${cat.bg}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 border ${cat.bg}`}>
                <Icon size={24} className={cat.color} />
              </div>
              <h2 className={`font-syne text-xl font-bold mb-2 ${cat.color}`}>{cat.label}</h2>
              <p className="text-sm text-muted-500 leading-relaxed">{cat.description}</p>
              <div className={`mt-4 text-xs font-bold tracking-wider ${cat.color} flex items-center gap-1`}>
                ПЕРЕГЛЯНУТИ →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-8 bg-panel-900 border border-line rounded-lg p-5">
        <p className="text-xs text-muted-500">
          <span className="font-bold text-text-100">Маєте ресурс для додавання?</span>{' '}
          Зверніться до адміністратора через розділ{' '}
          <Link href="/dashboard/notifications" className="text-bronze hover:underline">
            Повідомлення
          </Link>{' '}
          або напишіть нам на <span className="text-bronze">info@orden.veterans</span>.
        </p>
      </div>
    </div>
  );
}
