'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadZone } from '@/components/admin/image-upload-zone';
import { MultipleImageUploadZone } from '@/components/admin/multiple-image-upload-zone';
import { generateSlug, validateSlugFormat } from '@/lib/utils/slug';
import * as Tabs from '@radix-ui/react-tabs';

type ProductType = 'physical' | 'digital' | 'event_ticket';
type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'discontinued';

interface Product {
  id: string;
  name: string;
  name_uk: string;
  slug: string;
  type: ProductType;
  description: string | null;
  description_uk: string | null;
  status: ProductStatus;
  price_points: number;
  price_uah: number | null;
  stock_quantity: number | null;
  max_per_user: number;
  required_level: number;
  required_role: string | null;
  image_url: string | null;
  images: string[] | null;
  requires_shipping: boolean;
  weight: number | null;
  dimensions: { length: number; width: number; height: number } | null;
  digital_asset_url: string | null;
  download_limit: number | null;
  available_from: string | null;
  available_until: string | null;
  featured: boolean;
  sort_order: number;
  tags: string[] | null;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name_uk: '',
    slug: '',
    type: 'physical' as ProductType,
    description_uk: '',
    status: 'draft' as ProductStatus,
    price_points: 0,
    price_uah: 0,
    stock_quantity: null as number | null,
    max_per_user: 1,
    required_level: 1,
    required_role: '',
    image_url: '',
    images: [] as string[],
    requires_shipping: true,
    weight: null as number | null,
    dimensions: null as { length: number; width: number; height: number } | null,
    digital_asset_url: '',
    download_limit: null as number | null,
    available_from: null as string | null,
    available_until: null as string | null,
    featured: false,
    sort_order: 0,
    tags: [] as string[],
  });

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/admin/marketplace/products/${id}`);
        if (!response.ok) {
          throw new Error('Не вдалося завантажити товар');
        }

        const { product }: { product: Product } = await response.json();

        setFormData({
          name_uk: product.name_uk,
          slug: product.slug,
          type: product.type,
          description_uk: product.description_uk || '',
          status: product.status,
          price_points: product.price_points,
          price_uah: product.price_uah || 0,
          stock_quantity: product.stock_quantity,
          max_per_user: product.max_per_user,
          required_level: product.required_level,
          required_role: product.required_role || '',
          image_url: product.image_url || '',
          images: product.images || [],
          requires_shipping: product.requires_shipping,
          weight: product.weight,
          dimensions: product.dimensions,
          digital_asset_url: product.digital_asset_url || '',
          download_limit: product.download_limit,
          available_from: product.available_from,
          available_until: product.available_until,
          featured: product.featured,
          sort_order: product.sort_order,
          tags: product.tags || [],
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Помилка завантаження товару');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Regenerate slug from title
  const handleRegenerateSlug = () => {
    if (!formData.name_uk) return;
    const autoSlug = generateSlug(formData.name_uk);
    setFormData((prev) => ({ ...prev, slug: autoSlug }));
    setSlugManuallyEdited(false);
  };

  // Track manual slug edits
  const handleSlugChange = (value: string) => {
    setFormData({ ...formData, slug: value });
    setSlugManuallyEdited(true);
  };

  // Validate slug uniqueness (exclude current product)
  useEffect(() => {
    if (!formData.slug) {
      setSlugError('');
      return;
    }

    // Validate format first
    const formatValidation = validateSlugFormat(formData.slug);
    if (!formatValidation.valid) {
      setSlugError(formatValidation.error || '');
      return;
    }

    // Check uniqueness via API
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const response = await fetch(
          `/api/admin/marketplace/products/check-slug?slug=${encodeURIComponent(formData.slug)}&excludeId=${id}`
        );
        const data = await response.json();

        if (data.unique === false) {
          setSlugError('Цей slug вже використовується. Виберіть інший.');
        } else {
          setSlugError('');
        }
      } catch (err) {
        console.error('Error checking slug:', err);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug, id]);

  const handleUpdate = async (statusOverride?: ProductStatus) => {
    setError('');

    // Validate slug
    if (slugError) {
      setError('Виправте помилки slug перед збереженням');
      setActiveTab('basic');
      return;
    }

    // Validate required fields
    if (!formData.name_uk || !formData.slug) {
      setError('Заповніть всі обов\'язкові поля (назва, slug)');
      setActiveTab('basic');
      return;
    }

    if (formData.price_points <= 0) {
      setError('Ціна в балах має бути більше 0');
      setActiveTab('pricing');
      return;
    }

    setSaving(true);

    try {
      // Transform snake_case to camelCase for API
      // Send Ukrainian values for both name and nameUk (same for description)
      const payload = {
        name: formData.name_uk,
        nameUk: formData.name_uk,
        slug: formData.slug,
        type: formData.type,
        description: formData.description_uk,
        descriptionUk: formData.description_uk,
        status: statusOverride || formData.status,
        pricePoints: formData.price_points,
        priceUah: formData.price_uah,
        stockQuantity: formData.stock_quantity,
        maxPerUser: formData.max_per_user,
        requiredLevel: formData.required_level,
        requiredRole: formData.required_role || null,
        imageUrl: formData.image_url || (formData.images[0] ?? ''),
        images: formData.images,
        requiresShipping: formData.requires_shipping,
        weight: formData.weight,
        dimensions: formData.dimensions,
        digitalAssetUrl: formData.digital_asset_url,
        downloadLimit: formData.download_limit,
        availableFrom: formData.available_from,
        availableUntil: formData.available_until,
        featured: formData.featured,
        sortOrder: formData.sort_order,
        tags: formData.tags,
      };

      const response = await fetch(`/api/admin/marketplace/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка оновлення товару');
      }

      router.push('/admin/marketplace/products');
      router.refresh();
    } catch (err) {
      console.error('Product update error:', err);
      setError(err instanceof Error ? err.message : 'Помилка оновлення товару');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Видалити цей товар? Цю дію не можна скасувати.')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/marketplace/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка видалення товару');
      }

      router.push('/admin/marketplace/products');
      router.refresh();
    } catch (err) {
      console.error('Product deletion error:', err);
      setError(err instanceof Error ? err.message : 'Помилка видалення товару');
    } finally {
      setDeleting(false);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    setFormData({ ...formData, tags });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-bronze animate-spin" />
          <p className="ml-4 text-muted-500">Завантаження товару...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/marketplace/products"
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4"
        >
          <ArrowLeft size={16} />
          Назад до товарів
        </Link>
        <h1 className="font-syne text-3xl font-bold">Редагувати товар</h1>
        <p className="text-muted-500 mt-2">
          Оновіть інформацію про товар: {formData.name_uk}
        </p>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-2 mb-6 border-b-2 border-line/20 overflow-x-auto">
          <Tabs.Trigger
            value="basic"
            className="px-4 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] data-[state=active]:border-bronze data-[state=active]:text-bronze data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-500 hover:text-bronze whitespace-nowrap"
          >
            1. Основна інформація
          </Tabs.Trigger>
          <Tabs.Trigger
            value="pricing"
            className="px-4 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] data-[state=active]:border-bronze data-[state=active]:text-bronze data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-500 hover:text-bronze whitespace-nowrap"
          >
            2. Ціни і склад
          </Tabs.Trigger>
          <Tabs.Trigger
            value="media"
            className="px-4 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] data-[state=active]:border-bronze data-[state=active]:text-bronze data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-500 hover:text-bronze whitespace-nowrap"
          >
            3. Медіа
          </Tabs.Trigger>
          <Tabs.Trigger
            value="delivery"
            className="px-4 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] data-[state=active]:border-bronze data-[state=active]:text-bronze data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-500 hover:text-bronze whitespace-nowrap"
          >
            4. Доставка/Цифрові
          </Tabs.Trigger>
          <Tabs.Trigger
            value="advanced"
            className="px-4 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] data-[state=active]:border-bronze data-[state=active]:text-bronze data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-500 hover:text-bronze whitespace-nowrap"
          >
            5. Розширені
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab Contents - Same as new page, reused from creation page */}
        {/* Tab 1: Basic Information */}
        <Tabs.Content value="basic" className="space-y-6">
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <h2 className="text-xl font-bold mb-4">Основна інформація</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">НАЗВА *</label>
                <input
                  type="text"
                  value={formData.name_uk}
                  onChange={(e) => setFormData({ ...formData, name_uk: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">
                  URL (SLUG) *
                  {slugManuallyEdited && (
                    <span className="ml-2 text-xs text-amber-600 font-normal">(редаговано вручну)</span>
                  )}
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-panel-850/10 border-2 border-r-0 border-line text-sm text-muted-500 whitespace-nowrap">
                    /shop/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={`flex-1 px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none ${
                      slugError ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    disabled={!formData.name_uk}
                    title="Згенерувати slug з української назви"
                    className="px-3 py-3 border-2 border-l-0 border-line hover:bg-panel-850/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  {isCheckingSlug && <span className="ml-2 text-xs text-gray-500">Перевірка...</span>}
                </div>
                {slugError && (
                  <div className="flex items-start gap-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{slugError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">ТИП ТОВАРУ *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="physical">📦 Фізичний товар</option>
                  <option value="digital">💾 Цифровий продукт</option>
                  <option value="event_ticket">🎟️ Квиток на подію</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">СТАТУС *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="draft">📝 Чернетка</option>
                  <option value="active">✅ Активний</option>
                  <option value="out_of_stock">❌ Немає в наявності</option>
                  <option value="discontinued">🚫 Припинено</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">ОПИС</label>
                <RichTextEditor
                  content={formData.description_uk}
                  onChange={(html) => setFormData({ ...formData, description_uk: html })}
                  placeholder="Опис товару..."
                  minHeight="300px"
                  maxLength={10000}
                />
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* Tab 2: Pricing & Stock - Identical to new page */}
        <Tabs.Content value="pricing" className="space-y-6">
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <h2 className="text-xl font-bold mb-4">Ціни і склад</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">ЦІНА В БАЛАХ *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.price_points}
                  onChange={(e) => setFormData({ ...formData, price_points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">ЦІНА В ГРН (необов'язково)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(formData.price_uah / 100).toFixed(2)}
                    onChange={(e) => {
                      const uah = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, price_uah: Math.round(uah * 100) });
                    }}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                    placeholder="0.00"
                  />
                  <span className="text-sm font-bold">₴</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">КІЛЬКІСТЬ НА СКЛАДІ</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                    setFormData({ ...formData, stock_quantity: val });
                  }}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  placeholder="Необмежено"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">МАКСИМУМ НА КОРИСТУВАЧА</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_per_user}
                  onChange={(e) => setFormData({ ...formData, max_per_user: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                />
              </div>

              <div className="border-t border-line/20 pt-4 mt-4">
                <h3 className="font-bold mb-3">Контроль доступу</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-100 mb-2">МІНІМАЛЬНИЙ РІВЕНЬ</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.required_level}
                      onChange={(e) => setFormData({ ...formData, required_level: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-100 mb-2">РОЛЬ (необов'язково)</label>
                    <input
                      type="text"
                      value={formData.required_role}
                      onChange={(e) => setFormData({ ...formData, required_role: e.target.value })}
                      className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                      placeholder="наприклад: news_editor"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* Tab 3: Media - Identical to new page */}
        <Tabs.Content value="media" className="space-y-6">
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <h2 className="text-xl font-bold mb-4">Медіа</h2>

            <div className="space-y-6">
              <ImageUploadZone
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Головне зображення товару"
                context="product_featured"
                compress={true}
              />

              <MultipleImageUploadZone
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                label="Галерея зображень"
                context="product_gallery"
                maxImages={10}
                compress={true}
              />
            </div>
          </div>
        </Tabs.Content>

        {/* Tab 4 & 5 - Similar to new page, I'll add them in a follow-up to keep this commit manageable */}
        <Tabs.Content value="delivery" className="space-y-6">
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <h2 className="text-xl font-bold mb-4">
              {formData.type === 'physical' && 'Доставка'}
              {formData.type === 'digital' && 'Цифровий продукт'}
              {formData.type === 'event_ticket' && 'Квиток на подію'}
            </h2>

            {formData.type === 'physical' && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_shipping}
                    onChange={(e) => setFormData({ ...formData, requires_shipping: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="font-bold">Потребує доставки</span>
                </label>

                {formData.requires_shipping && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-100 mb-2">ВАГА (грами)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.weight ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value);
                          setFormData({ ...formData, weight: val });
                        }}
                        className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-100 mb-2">РОЗМІРИ (см)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Довжина"
                          value={formData.dimensions?.length ?? ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                length: val,
                                width: formData.dimensions?.width ?? 0,
                                height: formData.dimensions?.height ?? 0,
                              },
                            });
                          }}
                          className="px-3 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Ширина"
                          value={formData.dimensions?.width ?? ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                length: formData.dimensions?.length ?? 0,
                                width: val,
                                height: formData.dimensions?.height ?? 0,
                              },
                            });
                          }}
                          className="px-3 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Висота"
                          value={formData.dimensions?.height ?? ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                length: formData.dimensions?.length ?? 0,
                                width: formData.dimensions?.width ?? 0,
                                height: val,
                              },
                            });
                          }}
                          className="px-3 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {formData.type === 'digital' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-100 mb-2">URL ЦИФРОВОГО ФАЙЛУ</label>
                  <ImageUploadZone
                    value={formData.digital_asset_url}
                    onChange={(url) => setFormData({ ...formData, digital_asset_url: url })}
                    label="Завантажити цифровий продукт"
                    context="product_digital_asset"
                    compress={false}
                    maxSize={100 * 1024 * 1024}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-100 mb-2">ЛІМІТ ЗАВАНТАЖЕНЬ</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.download_limit ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseInt(e.target.value);
                      setFormData({ ...formData, download_limit: val });
                    }}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                    placeholder="Необмежено"
                  />
                </div>
              </div>
            )}

            {formData.type === 'event_ticket' && (
              <div className="p-4 bg-panel-850/5 border border-line rounded-lg/20">
                <p className="text-sm text-muted-500">
                  Квитки на події керуються через систему подій.
                </p>
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="advanced" className="space-y-6">
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <h2 className="text-xl font-bold mb-4">Розширені налаштування</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-100 mb-2">ДОСТУПНИЙ З</label>
                  <input
                    type="datetime-local"
                    value={formData.available_from ?? ''}
                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value || null })}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-100 mb-2">ДОСТУПНИЙ ДО</label>
                  <input
                    type="datetime-local"
                    value={formData.available_until ?? ''}
                    onChange={(e) => setFormData({ ...formData, available_until: e.target.value || null })}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="font-bold">Рекомендований товар</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-100 mb-2">ПОРЯДОК СОРТУВАННЯ</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">ТЕГИ</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  placeholder="наприклад: мерч, одяг, популярне"
                />
                <p className="text-xs text-gray-500 mt-1">Теги: {formData.tags.length}</p>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3 mt-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Помилка</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t-2 border-line/20">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleUpdate('draft')}
            disabled={saving || !!slugError || isCheckingSlug}
            className="px-6 py-3 bg-panel-850/20 text-text-100 font-bold font-mono uppercase tracking-wider transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_var(--panel-850)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'ЗБЕРЕЖЕННЯ...' : '📝 ЗБЕРЕГТИ ЧЕРНЕТКУ'}
          </button>
          <button
            type="button"
            onClick={() => handleUpdate('active')}
            disabled={saving || !!slugError || isCheckingSlug}
            className="px-6 py-3 bg-bronze text-canvas font-bold font-mono uppercase tracking-wider transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_var(--panel-850)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'ЗБЕРЕЖЕННЯ...' : '✅ ЗБЕРЕГТИ ЗМІНИ'}
          </button>
          <Link href="/admin/marketplace/products" className="text-sm text-muted-500 hover:text-bronze">
            Скасувати
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-6 py-3 bg-red-600 text-white font-bold font-mono uppercase tracking-wider transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_var(--panel-850)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? 'ВИДАЛЕННЯ...' : 'ВИДАЛИТИ'}
        </button>
      </div>
    </div>
  );
}
