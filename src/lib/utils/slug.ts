import slugify from 'slugify';

// Ukrainian transliteration map (based on official Ukrainian romanization)
const ukrToLatin: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye',
  ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '',
  ю: 'yu', я: 'ya', ъ: '',
  А: 'A', Б: 'B', В: 'V', Г: 'H', Ґ: 'G', Д: 'D', Е: 'E', Є: 'Ye',
  Ж: 'Zh', З: 'Z', И: 'Y', І: 'I', Ї: 'Yi', Й: 'Y', К: 'K', Л: 'L',
  М: 'M', Н: 'N', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U',
  Ф: 'F', Х: 'Kh', Ц: 'Ts', Ч: 'Ch', Ш: 'Sh', Щ: 'Shch', Ь: '',
  Ю: 'Yu', Я: 'Ya',
  // Apostrophes (soft sign separators)
  "\u0027": '', // apostrophe '
  "\u2019": '', // right single quote '
};

/**
 * Transliterate Ukrainian/Cyrillic text to Latin
 */
function transliterate(text: string): string {
  return text
    .split('')
    .map(char => ukrToLatin[char] ?? char)
    .join('');
}

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
  const latinized = transliterate(title);

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
