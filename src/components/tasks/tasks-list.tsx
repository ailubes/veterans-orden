'use client';

import { CheckSquare, Clock, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ClaimButton, CompleteButton } from '@/components/tasks/task-actions';
import { LinkifyText } from '@/components/ui/linkify-text';
import FeatureGate from '@/components/ui/feature-gate';

interface TasksListProps {
  myTasks: any[] | null;
  openTasks: any[] | null;
  completedCount: number | null;
  userPoints: number | null;
}

const priorityColors = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400',
};

const priorityLabels = {
  urgent: 'ТЕРМІНОВО',
  high: 'ВИСОКИЙ',
  medium: 'СЕРЕДНІЙ',
  low: 'НИЗЬКИЙ',
};

const typeLabels = {
  recruitment: 'Рекрутинг',
  outreach: 'Охоплення',
  event_support: 'Підтримка подій',
  content: 'Контент',
  administrative: 'Адміністративне',
  other: 'Інше',
};

export default function TasksList({ myTasks, openTasks, completedCount, userPoints }: TasksListProps) {
  return (
    <FeatureGate featureKey="tasks_execute">
      {/* My Tasks */}
      {myTasks && myTasks.length > 0 && (
        <div className="mb-12">
          <h2 className="font-syne text-xl font-bold mb-4">
            В роботі ({myTasks.length})
          </h2>
          <div className="space-y-3">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="bg-accent/5 border-2 border-accent p-4 relative"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold mb-1">{task.title}</h3>
                    <div className="text-sm text-timber-beam line-clamp-2">
                      <LinkifyText text={task.description || ''} maxUrlLength={35} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-timber-beam">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          До {formatDate(task.due_date)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star size={12} />
                        {task.points} балів
                      </span>
                    </div>
                  </div>
                  {task.status === 'pending_review' ? (
                    <div className="flex-shrink-0 px-4 py-2 bg-purple-100 text-purple-700 text-sm font-bold flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      НА ПЕРЕВІРЦІ
                    </div>
                  ) : (
                    <CompleteButton
                      taskId={task.id}
                      requiresProof={task.requires_proof}
                      points={task.points || 0}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div>
        <h2 className="font-syne text-xl font-bold mb-4">
          Доступні завдання
        </h2>

        {openTasks && openTasks.length > 0 ? (
          <div className="space-y-3">
            {openTasks.map((task) => (
              <div
                key={task.id}
                className="bg-canvas border-2 border-timber-dark p-4 relative hover:border-accent transition-colors"
              >
                <div className="joint joint-tl" />

                <div className="flex items-start gap-4">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-timber-dark/10 text-xs">
                        {typeLabels[task.type as keyof typeof typeLabels] || task.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs text-white ${
                          priorityColors[task.priority as keyof typeof priorityColors]
                        }`}
                      >
                        {priorityLabels[task.priority as keyof typeof priorityLabels]}
                      </span>
                    </div>
                    <h3 className="font-bold mb-1">{task.title}</h3>
                    <div className="text-sm text-timber-beam line-clamp-2">
                      <LinkifyText text={task.description || ''} maxUrlLength={35} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-timber-beam">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          До {formatDate(task.due_date)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-accent font-bold">
                        <Star size={12} />
                        +{task.points} балів
                      </span>
                    </div>
                  </div>
                  <ClaimButton taskId={task.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-canvas border-2 border-timber-dark p-12 relative text-center">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-timber-beam" />
            <h3 className="font-syne text-xl font-bold mb-2">
              Всі завдання виконані!
            </h3>
            <p className="text-sm text-timber-beam mb-6">
              Нові завдання з&apos;являться найближчим часом
            </p>
            <Link href="/dashboard" className="text-accent hover:underline text-sm">
              ← Повернутися до огляду
            </Link>
          </div>
        )}
      </div>

      {/* Points Info */}
      <div className="mt-8 bg-timber-dark text-canvas p-4 relative">
        <div className="joint joint-tl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-1">Ваші бали</p>
            <p className="text-2xl font-syne font-bold flex items-center gap-2">
              <Star size={20} />
              {userPoints || 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm mb-1">Виконано завдань</p>
            <p className="text-2xl font-syne font-bold">{completedCount || 0}</p>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
