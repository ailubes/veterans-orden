'use client';

import { useState } from 'react';
import { X, Download, Trash2, Ban, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: () => Promise<void>;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClear: () => void;
  actions: BulkAction[];
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onClear,
  actions,
}: BulkActionsToolbarProps) {
  const [executing, setExecuting] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  if (selectedCount === 0) return null;

  const handleAction = async (action: BulkAction) => {
    setExecuting(true);
    setCurrentAction(action.id);

    try {
      await action.onClick();
      toast({
        title: 'Успішно виконано',
        description: `Дію "${action.label}" застосовано до ${selectedCount} записів`,
      });
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description:
          error instanceof Error
            ? error.message
            : 'Не вдалося виконати дію',
      });
    } finally {
      setExecuting(false);
      setCurrentAction(null);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-timber-dark text-canvas border-4 border-accent shadow-2xl">
        <div className="flex items-center gap-6 px-6 py-4">
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold">
              {selectedCount}
            </div>
            <div>
              <p className="font-syne font-bold text-sm">
                Обрано {selectedCount} з {totalCount}
              </p>
              <p className="text-xs opacity-75">Виберіть дію нижче</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-canvas/30" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={executing}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  action.variant === 'destructive'
                    ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                    : 'border-canvas bg-canvas text-timber-dark hover:bg-canvas/90'
                }`}
              >
                {executing && currentAction === action.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  action.icon
                )}
                {action.label}
              </button>
            ))}
          </div>

          {/* Clear button */}
          <button
            onClick={onClear}
            disabled={executing}
            className="ml-2 p-2 hover:bg-canvas/10 rounded transition-colors disabled:opacity-50"
            title="Скасувати вибір"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar (when executing) */}
        {executing && (
          <div className="h-1 bg-canvas/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

// Pre-defined common bulk actions
export const commonBulkActions = {
  export: (handler: () => Promise<void>): BulkAction => ({
    id: 'export',
    label: 'Експортувати',
    icon: <Download className="w-4 h-4" />,
    onClick: handler,
  }),

  delete: (handler: () => Promise<void>): BulkAction => ({
    id: 'delete',
    label: 'Видалити',
    icon: <Trash2 className="w-4 h-4" />,
    variant: 'destructive',
    onClick: handler,
  }),

  activate: (handler: () => Promise<void>): BulkAction => ({
    id: 'activate',
    label: 'Активувати',
    icon: <Check className="w-4 h-4" />,
    onClick: handler,
  }),

  suspend: (handler: () => Promise<void>): BulkAction => ({
    id: 'suspend',
    label: 'Призупинити',
    icon: <Ban className="w-4 h-4" />,
    variant: 'destructive',
    onClick: handler,
  }),
};
