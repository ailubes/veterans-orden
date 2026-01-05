'use client';

import { Forward, Trash2, X } from 'lucide-react';

interface SelectionActionBarProps {
  selectedCount: number;
  onForward: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function SelectionActionBar({
  selectedCount,
  onForward,
  onDelete,
  onCancel,
}: SelectionActionBarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-panel-850 border-t border-line/20">
      {/* Selection count */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="p-1 hover:bg-panel-850/10 rounded transition-colors"
          title="Скасувати вибір"
        >
          <X className="w-5 h-5 text-text-100" />
        </button>
        <span className="text-sm font-medium text-text-100">
          Вибрано: {selectedCount}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onForward}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bronze text-canvas rounded hover:bg-bronze/90 transition-colors text-sm font-medium"
        >
          <Forward className="w-4 h-4" />
          Переслати
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Видалити
        </button>
      </div>
    </div>
  );
}
