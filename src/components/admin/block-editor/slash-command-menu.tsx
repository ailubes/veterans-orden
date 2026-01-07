'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Type,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  ImageIcon,
  AlertCircle,
  CreditCard,
  LayoutGrid,
  ChevronDown,
  ListChecks,
  MousePointer,
  Video,
  Columns,
} from 'lucide-react';

interface SlashCommandMenuProps {
  position: { x: number; y: number };
  onSelect: (command: string) => void;
  onClose: () => void;
}

const commands = [
  { id: 'heading2', icon: Heading2, label: 'Заголовок 2', description: 'Великий заголовок' },
  { id: 'heading3', icon: Heading3, label: 'Заголовок 3', description: 'Підзаголовок' },
  { id: 'bulletList', icon: List, label: 'Маркований список', description: 'Простий список' },
  { id: 'orderedList', icon: ListOrdered, label: 'Нумерований список', description: 'Список з номерами' },
  { id: 'blockquote', icon: Quote, label: 'Цитата', description: 'Виділена цитата' },
  { id: 'codeBlock', icon: Code, label: 'Блок коду', description: 'Код з підсвіткою' },
  { id: 'horizontalRule', icon: Minus, label: 'Розділювач', description: 'Горизонтальна лінія' },
  { id: 'image', icon: ImageIcon, label: 'Зображення', description: 'Завантажити картинку' },
  { id: 'divider', icon: null, label: '--- Компоненти ---', description: '', disabled: true },
  { id: 'callout', icon: AlertCircle, label: 'Сповіщення', description: 'Важлива інформація' },
  { id: 'card', icon: CreditCard, label: 'Картка', description: 'Картка з контентом' },
  { id: 'cardGrid', icon: LayoutGrid, label: 'Сітка карток', description: 'Кілька карток в ряд' },
  { id: 'accordion', icon: ChevronDown, label: 'Акордеон', description: 'Розкриваний блок' },
  { id: 'tabs', icon: Columns, label: 'Вкладки', description: 'Контент у вкладках' },
  { id: 'steps', icon: ListChecks, label: 'Кроки', description: 'Покрокова інструкція' },
  { id: 'cta', icon: MousePointer, label: 'Заклик до дії', description: 'Кнопка з текстом' },
  { id: 'video', icon: Video, label: 'Відео', description: 'YouTube/Vimeo' },
];

export function SlashCommandMenu({ position, onSelect, onClose }: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get only selectable commands (not dividers)
  const selectableCommands = filteredCommands.filter((cmd) => !cmd.disabled);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < selectableCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : selectableCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectableCommands[selectedIndex]) {
            onSelect(selectableCommands[selectedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          // Allow typing to filter
          if (e.key.length === 1) {
            setSearchQuery((prev) => prev + e.key);
          } else if (e.key === 'Backspace') {
            setSearchQuery((prev) => prev.slice(0, -1));
          }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, selectableCommands, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto bg-panel-850 border border-line rounded-lg shadow-xl"
      style={{
        left: Math.min(position.x, window.innerWidth - 300),
        top: Math.min(position.y + 5, window.innerHeight - 350),
      }}
    >
      {searchQuery && (
        <div className="px-3 py-2 border-b border-line">
          <span className="text-xs text-muted-500">Пошук: </span>
          <span className="text-xs text-text-100">{searchQuery}</span>
        </div>
      )}

      <div className="py-1">
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-500">
            Нічого не знайдено
          </div>
        ) : (
          filteredCommands.map((cmd, index) => {
            if (cmd.disabled) {
              return (
                <div
                  key={cmd.id}
                  className="px-3 py-1.5 text-xs font-bold text-muted-500 bg-panel-900"
                >
                  {cmd.label.replace(/---/g, '').trim()}
                </div>
              );
            }

            const selectableIndex = selectableCommands.findIndex((c) => c.id === cmd.id);
            const Icon = cmd.icon;

            return (
              <button
                key={cmd.id}
                type="button"
                onClick={() => onSelect(cmd.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                  ${selectableIndex === selectedIndex ? 'bg-bronze/20 text-bronze' : 'text-text-100 hover:bg-panel-900'}
                `}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{cmd.label}</div>
                  <div className="text-xs text-muted-500 truncate">{cmd.description}</div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
