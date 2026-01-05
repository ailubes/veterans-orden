import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    icon: string;
    current: number;
    target: number;
    isCompleted: boolean;
    progressPercent: number;
  };
}

/**
 * TaskCard component for progression tasks
 * Shows task with checkbox, progress bar, and CTA
 */
export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className={`
      border-2 bg-panel-900 card-with-joints
      ${task.isCompleted
        ? 'border-green-600 bg-green-50'
        : 'border-line'
      }
      p-6 transition-all duration-200 hover:shadow-lg
    `}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          {task.isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6 text-timber-dark/40" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-syne text-xl font-semibold mb-2
            ${task.isCompleted ? 'text-green-700' : 'text-timber-dark'}
          `}>
            {task.title}
          </h3>

          <p className="font-mono text-sm text-timber-dark/80 mb-4">
            {task.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-mono text-xs text-timber-dark/60">
                Прогрес
              </span>
              <span className="font-mono text-sm font-semibold text-timber-dark">
                {task.current} / {task.target}
              </span>
            </div>
            <div className="h-2 bg-timber-dark/10 rounded-full overflow-hidden">
              <div
                className={`
                  h-full rounded-full transition-all duration-500
                  ${task.isCompleted ? 'bg-green-600' : 'bg-bronze'}
                `}
                style={{ width: `${task.progressPercent}%` }}
              />
            </div>
          </div>

          {/* CTA Button */}
          {!task.isCompleted && (
            <Link
              href={task.ctaUrl}
              className="
                inline-flex items-center gap-2
                px-4 py-2
                bg-bronze text-canvas
                font-mono text-sm font-semibold
                border-2 border-bronze
                transition-all duration-200
                hover:bg-timber-dark hover:border-line
              "
            >
              {task.ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {task.isCompleted && (
            <div className="inline-flex items-center gap-2 font-mono text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Завершено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
