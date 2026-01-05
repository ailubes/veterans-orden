import { CheckCircle2, Lock } from 'lucide-react';

interface RoleJourneyProps {
  roles: Array<{
    role: string;
    level: number;
    displayName: string;
    icon: string;
    isPast: boolean;
    isCurrent: boolean;
    isFuture: boolean;
  }>;
}

/**
 * RoleJourney component - vertical timeline of all 8 roles
 * Shows past (completed), current (active), and future (locked) roles
 */
export default function RoleJourney({ roles }: RoleJourneyProps) {
  return (
    <div className="border border-line rounded-lg bg-panel-900 card-with-joints p-6">
      <h2 className="font-syne text-2xl font-bold text-timber-dark mb-6">
        Шлях прогресу
      </h2>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-timber-dark/20" />

        <div className="space-y-6">
          {roles.map((role, index) => (
            <div key={role.role} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className={`
                relative z-10 flex-shrink-0
                w-12 h-12 rounded-full
                border-2
                flex items-center justify-center
                transition-all duration-300
                ${role.isPast
                  ? 'bg-green-600 border-green-600'
                  : role.isCurrent
                    ? 'bg-bronze border-bronze animate-pulse'
                    : 'bg-panel-900 border-line/30'
                }
              `}>
                {role.isPast && (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                )}
                {role.isCurrent && (
                  <div className="w-4 h-4 bg-white rounded-full" />
                )}
                {role.isFuture && (
                  <Lock className="w-6 h-6 text-timber-dark/40" />
                )}
              </div>

              {/* Role info */}
              <div className={`
                flex-1 pb-2
                ${role.isFuture ? 'opacity-50' : 'opacity-100'}
              `}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`
                    font-syne text-lg font-semibold
                    ${role.isPast
                      ? 'text-green-700'
                      : role.isCurrent
                        ? 'text-bronze'
                        : 'text-timber-dark/60'
                    }
                  `}>
                    {role.displayName}
                  </span>
                  <span className="font-mono text-xs text-timber-dark/50">
                    Рівень {role.level}
                  </span>
                </div>

                {role.isCurrent && (
                  <div className="inline-block px-2 py-1 bg-bronze/10 border border-bronze/30 mt-1">
                    <span className="font-mono text-xs text-bronze font-semibold">
                      Поточний рівень
                    </span>
                  </div>
                )}

                {role.isPast && (
                  <div className="font-mono text-xs text-green-600 mt-1">
                    ✓ Досягнуто
                  </div>
                )}

                {role.isFuture && index === roles.findIndex(r => r.isFuture) && (
                  <div className="font-mono text-xs text-timber-dark/60 mt-1">
                    Наступна мета
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
