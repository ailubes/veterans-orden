'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Folder,
  ArrowUp,
  ArrowDown,
  Save,
  X,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: string;
  nameUk: string;
  nameEn: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  order: number;
  isVisible: boolean;
  articleCount: number;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [formNameUk, setFormNameUk] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Icon picker state
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  // Available Lucide icons for help system
  const availableIcons = [
    'Rocket',
    'Zap',
    'HelpCircle',
    'Shield',
    'Video',
    'Settings',
    'Book',
    'Users',
    'Calendar',
    'Vote',
    'CheckSquare',
    'ShoppingBag',
    'Coins',
    'Bell',
    'FileText',
    'Folder',
    'MessageSquare',
    'TrendingUp',
    'Lock',
    'Unlock',
    'Key',
    'Mail',
    'Phone',
    'MapPin',
    'Heart',
    'Star',
    'Award',
    'Target',
    'Flag',
  ];

  const filteredIcons = availableIcons.filter((icon) =>
    icon.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/help/categories');
      const data = await response.json();

      // Build tree structure
      const categoryMap = new Map<string, Category>();
      (data.categories || []).forEach((cat: any) => {
        categoryMap.set(cat.id, {
          id: cat.id,
          nameUk: cat.name_uk,
          nameEn: cat.name_en,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          parentId: cat.parent_id,
          order: cat.order,
          isVisible: cat.is_visible,
          articleCount: cat.articleCount || 0,
          children: [],
        });
      });

      const rootCategories: Category[] = [];
      categoryMap.forEach((category) => {
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(category);
          } else {
            rootCategories.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });

      // Sort by order
      const sortByOrder = (cats: Category[]) => {
        cats.sort((a, b) => a.order - b.order);
        cats.forEach((cat) => {
          if (cat.children && cat.children.length > 0) {
            sortByOrder(cat.children);
          }
        });
      };
      sortByOrder(rootCategories);

      setCategories(rootCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Open modal for create
  const openCreateModal = (parentId: string | null = null) => {
    setModalMode('create');
    setEditingCategory(null);
    setFormNameUk('');
    setFormNameEn('');
    setFormSlug('');
    setFormDescription('');
    setFormIcon('');
    setFormParentId(parentId || '');
    setFormOrder(0);
    setFormIsVisible(true);
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (category: Category) => {
    setModalMode('edit');
    setEditingCategory(category);
    setFormNameUk(category.nameUk);
    setFormNameEn(category.nameEn);
    setFormSlug(category.slug);
    setFormDescription(category.description || '');
    setFormIcon(category.icon || '');
    setFormParentId(category.parentId || '');
    setFormOrder(category.order);
    setFormIsVisible(category.isVisible);
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formNameUk.trim() || !formNameEn.trim() || !formSlug.trim()) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }

    setFormSubmitting(true);

    try {
      const url =
        modalMode === 'create'
          ? '/api/admin/help/categories'
          : `/api/admin/help/categories/${editingCategory?.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameUk: formNameUk,
          nameEn: formNameEn,
          slug: formSlug,
          description: formDescription || null,
          icon: formIcon || null,
          parentId: formParentId || null,
          order: formOrder,
          isVisible: formIsVisible,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      alert(
        modalMode === 'create'
          ? 'Категорію успішно створено!'
          : 'Категорію успішно оновлено!'
      );
      setShowModal(false);
      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(`Помилка: ${error.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    if (category.articleCount > 0) {
      alert(
        `Не можна видалити категорію, яка містить ${category.articleCount} статей. Спочатку перемістіть або видаліть статті.`
      );
      return;
    }

    if (category.children && category.children.length > 0) {
      alert(
        'Не можна видалити категорію, яка містить підкатегорії. Спочатку видаліть або перемістіть підкатегорії.'
      );
      return;
    }

    if (
      !confirm(
        `Ви впевнені, що хочете видалити категорію "${category.nameUk}"? Цю дію не можна скасувати.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/help/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      alert('Категорію успішно видалено');
      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(`Помилка: ${error.message}`);
    }
  };

  // Toggle visibility
  const toggleVisibility = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/help/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isVisible: !category.isVisible,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to toggle visibility:', error);
      alert(`Помилка: ${error.message}`);
    }
  };

  // Render icon
  const renderIcon = (iconName: string | null) => {
    if (!iconName) return <Folder size={20} className="text-muted-500" />;
    const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<any> | undefined;
    if (!IconComponent) return <Folder size={20} className="text-muted-500" />;
    return <IconComponent size={20} className="text-bronze" />;
  };

  // Render category row
  const renderCategory = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-3 py-3 px-4 hover:bg-panel-850/5 transition-colors border-b border-line/10 ${
            depth > 0 ? 'ml-' + depth * 8 : ''
          }`}
          style={{ paddingLeft: `${depth * 32 + 16}px` }}
        >
          {/* Expand/Collapse */}
          <button
            onClick={() => toggleExpand(category.id)}
            className={`p-1 hover:bg-panel-850/10 transition-colors ${
              hasChildren ? '' : 'invisible'
            }`}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Icon */}
          <div className="flex-shrink-0">{renderIcon(category.icon)}</div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold truncate">{category.nameUk}</p>
              {!category.isVisible && (
                <span className="px-2 py-0.5 text-xs font-bold bg-gray-600/10 text-gray-600 border border-gray-600">
                  ПРИХОВАНА
                </span>
              )}
            </div>
            <p className="text-xs text-muted-500 truncate">/{category.slug}</p>
          </div>

          {/* Article Count */}
          <div className="flex-shrink-0 text-sm text-muted-500">
            {category.articleCount} статей
          </div>

          {/* Order */}
          <div className="flex-shrink-0 text-sm text-muted-500 w-16 text-center">
            #{category.order}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggleVisibility(category)}
              className="p-2 hover:bg-panel-850/10 transition-colors"
              title={category.isVisible ? 'Приховати' : 'Показати'}
            >
              {category.isVisible ? (
                <Eye size={16} className="text-muted-500" />
              ) : (
                <EyeOff size={16} className="text-muted-500" />
              )}
            </button>

            <button
              onClick={() => openCreateModal(category.id)}
              className="p-2 hover:bg-panel-850/10 transition-colors"
              title="Додати підкатегорію"
            >
              <Plus size={16} className="text-muted-500" />
            </button>

            <button
              onClick={() => openEditModal(category)}
              className="p-2 hover:bg-bronze/10 transition-colors"
              title="Редагувати"
            >
              <Edit size={16} className="text-bronze" />
            </button>

            <button
              onClick={() => handleDelete(category)}
              className="p-2 hover:bg-red-600/10 transition-colors"
              title="Видалити"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-line border-t-accent"></div>
          <p className="mt-4 text-muted-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-3xl font-bold mb-2">Категорії довідки</h1>
          <p className="text-muted-500">
            Керуйте категоріями та підкатегоріями центру допомоги
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-6 py-3 bg-bronze text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all"
        >
          <Plus size={20} />
          Нова категорія
        </button>
      </div>

      {/* Categories Tree */}
      <div className="bg-white border border-line rounded-lg relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        {/* Table Header */}
        <div className="flex items-center gap-3 py-3 px-4 bg-panel-850 text-canvas font-bold text-sm border-b-2 border-line">
          <div className="w-8"></div>
          <div className="w-8">Ікона</div>
          <div className="flex-1">Назва</div>
          <div className="w-24">Статті</div>
          <div className="w-16 text-center">Порядок</div>
          <div className="w-40 text-center">Дії</div>
        </div>

        {/* Categories */}
        {categories.length === 0 ? (
          <div className="p-12 text-center text-muted-500">
            <Folder className="mx-auto mb-2" size={48} />
            Категорії не знайдені
          </div>
        ) : (
          <div>{categories.map((category) => renderCategory(category))}</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-line rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-line">
              <h2 className="font-syne text-2xl font-bold">
                {modalMode === 'create' ? 'Нова категорія' : 'Редагувати категорію'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-panel-850/10 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name UK */}
              <div>
                <label className="block font-bold mb-2">
                  Назва (українською) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formNameUk}
                  onChange={(e) => setFormNameUk(e.target.value)}
                  placeholder="Початок роботи"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none"
                />
              </div>

              {/* Name EN */}
              <div>
                <label className="block font-bold mb-2">
                  Назва (англійською) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="Getting Started"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-bold mb-2">
                  URL-слаг <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) =>
                    setFormSlug(
                      e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                    )
                  }
                  placeholder="getting-started"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none font-mono text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold mb-2">Опис</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Опис категорії..."
                  className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block font-bold mb-2">Іконка</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full px-4 py-2 border border-line rounded-lg hover:border-bronze transition-colors flex items-center gap-3"
                  >
                    {formIcon ? renderIcon(formIcon) : <Folder size={20} className="text-muted-500" />}
                    <span className="flex-1 text-left">
                      {formIcon || 'Оберіть іконку...'}
                    </span>
                  </button>

                  {/* Icon Picker Dropdown */}
                  {showIconPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-line rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          value={iconSearchQuery}
                          onChange={(e) => setIconSearchQuery(e.target.value)}
                          placeholder="Пошук іконки..."
                          className="w-full px-3 py-2 border border-line rounded-lg focus:border-bronze outline-none text-sm mb-2"
                        />

                        <div className="grid grid-cols-6 gap-2">
                          {filteredIcons.map((iconName) => {
                            const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<any>;
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() => {
                                  setFormIcon(iconName);
                                  setShowIconPicker(false);
                                  setIconSearchQuery('');
                                }}
                                className={`p-3 border-2 hover:border-bronze transition-colors flex items-center justify-center ${
                                  formIcon === iconName
                                    ? 'border-bronze bg-bronze/10'
                                    : 'border-line/20'
                                }`}
                                title={iconName}
                              >
                                <IconComponent size={20} className="text-bronze" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Category */}
              <div>
                <label className="block font-bold mb-2">Батьківська категорія</label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none font-bold"
                >
                  <option value="">Немає (кореневий рівень)</option>
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      disabled={modalMode === 'edit' && cat.id === editingCategory?.id}
                    >
                      {cat.nameUk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block font-bold mb-2">Порядок</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none"
                  min="0"
                />
                <p className="text-xs text-muted-500 mt-1">
                  Менше число = вище в списку
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="w-5 h-5 border border-line rounded-lg accent-accent"
                  />
                  <span className="font-bold">Видима для користувачів</span>
                </label>
                <p className="text-xs text-muted-500 mt-1 ml-8">
                  Приховані категорії не відображаються в публічному центрі допомоги
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-line">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-line rounded-lg hover:bg-panel-850/10 transition-colors font-bold"
              >
                Скасувати
              </button>

              <button
                onClick={handleSubmit}
                disabled={formSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-bronze text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all disabled:opacity-50"
              >
                <Save size={18} />
                {modalMode === 'create' ? 'Створити' : 'Зберегти'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
