import tr from 'transliteration';
import slugify from 'slugify';

/**
 * Generate a URL-safe slug from Ukrainian/Cyrillic text
 *
 * Examples:
 * - "Новини з України" → "novini-z-ukraini"
 * - "Мережа Вільних Людей" → "merezha-vilnikh-lyudey"
 * - "2024: Рік змін!" → "2024-rik-zmin"
 */
export function generateSlug(title: string): string {
  if (!title || title.trim() === '') {
    return '';
  }

  // Step 1: Transliterate Cyrillic to Latin
  const latinized = tr.transliterate(title);

  // Step 2: Convert to URL-safe slug
  return slugify(latinized, {
    lower: true,
    strict: true,
    locale: 'uk',
    remove: /[*+~.()'"!:@]/g,
    trim: true,
  });
}

/**
 * Validate slug format
 *
 * @param slug The slug to validate
 * @returns {valid: boolean, error?: string}
 */
export function validateSlugFormat(slug: string): {
  valid: boolean;
  error?: string;
} {
  if (!slug || slug.trim() === '') {
    return { valid: false, error: 'Slug не може бути порожнім' };
  }

  if (slug.length < 3) {
    return { valid: false, error: 'Slug має бути мінімум 3 символи' };
  }

  if (slug.length > 255) {
    return { valid: false, error: 'Slug занадто довгий (максимум 255 символів)' };
  }

  // Slug must be lowercase alphanumeric with hyphens only
  const validPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!validPattern.test(slug)) {
    return {
      valid: false,
      error: 'Slug може містити тільки малі літери, цифри та дефіси',
    };
  }

  // Slug cannot start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug не може починатися або закінчуватися дефісом' };
  }

  return { valid: true };
}
