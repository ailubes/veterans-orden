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
  low: 'bg-muted-500',
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
          <h2 className="font-syne text-xl font-bold text-text-100 mb-4">
            В роботі ({myTasks.length})
          </h2>
          <div className="space-y-3">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="bg-bronze/10 border border-bronze p-4 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-100 mb-1">{task.title}</h3>
                    <div className="text-sm text-muted-500 line-clamp-2">
                      <LinkifyText text={task.description || ''} maxUrlLength={35} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-500">
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
                    <div className="flex-shrink-0 px-4 py-2 bg-purple-500/10 text-purple-400 text-sm font-bold flex items-center gap-2 rounded">
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
        <h2 className="font-syne text-xl font-bold text-text-100 mb-4">
          Доступні завдання
        </h2>

        {openTasks && openTasks.length > 0 ? (
          <div className="space-y-3">
            {openTasks.map((task) => (
              <div
                key={task.id}
                className="bg-panel-900 border border-line p-4 rounded-lg hover:border-bronze/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-panel-850 text-muted-500 text-xs rounded">
                        {typeLabels[task.type as keyof typeof typeLabels] || task.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs text-white rounded ${
                          priorityColors[task.priority as keyof typeof priorityColors]
                        }`}
                      >
                        {priorityLabels[task.priority as keyof typeof priorityLabels]}
                      </span>
                    </div>
                    <h3 className="font-bold text-text-100 mb-1">{task.title}</h3>
                    <div className="text-sm text-muted-500 line-clamp-2">
                      <LinkifyText text={task.description || ''} maxUrlLength={35} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-500">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          До {formatDate(task.due_date)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-bronze font-bold">
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
          <div className="bg-panel-900 border border-line p-12 rounded-lg text-center">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-500" />
            <h3 className="font-syne text-xl font-bold text-text-100 mb-2">
              Всі завдання виконані!
            </h3>
            <p className="text-sm text-muted-500 mb-6">
              Нові завдання з&apos;являться найближчим часом
            </p>
            <Link href="/dashboard" className="text-bronze hover:underline text-sm">
              ← Повернутися до огляду
            </Link>
          </div>
        )}
      </div>

      {/* Points Info */}
      <div className="mt-8 bg-bronze text-bg-950 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-1 opacity-80">Ваші бали</p>
            <p className="text-2xl font-syne font-bold flex items-center gap-2">
              <Star size={20} />
              {userPoints || 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm mb-1 opacity-80">Виконано завдань</p>
            <p className="text-2xl font-syne font-bold">{completedCount || 0}</p>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
