import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Kyiv timezone constant (UTC+2 in winter, UTC+3 in summer with DST)
export const KYIV_TIMEZONE = 'Europe/Kyiv';

/**
 * Convert a date to Kyiv timezone
 * @param date - Date string or Date object
 * @returns Date object adjusted for display purposes
 */
export function toKyivTime(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Format number with thousands separators
 * Example: 1000 -> 1,000
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('uk-UA');
}

/**
 * Format date to Ukrainian format: DD.MM.YYYY (in Kyiv timezone)
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  // Use Intl.DateTimeFormat for proper timezone handling
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: KYIV_TIMEZONE,
  });

  // Format returns "DD.MM.YYYY" in uk-UA locale
  return formatter.format(d);
}

/**
 * Format time to 24-hour format: HH:MM (in Kyiv timezone)
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  // Use Intl.DateTimeFormat for proper timezone handling
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: KYIV_TIMEZONE,
  });

  return formatter.format(d);
}

/**
 * Format date and time to Ukrainian format: DD.MM.YYYY HH:MM
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Format date to short Ukrainian format: DD MMM (in Kyiv timezone)
 * @param date - Date string or Date object
 * @returns Formatted short date string (e.g., "25 гру")
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  // Use Intl.DateTimeFormat for proper timezone handling
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    timeZone: KYIV_TIMEZONE,
  });

  return formatter.format(d);
}

/**
 * Format date to relative time (e.g., "2 години тому")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'щойно';
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays < 7) return `${diffDays} дн тому`;

  return formatDate(d);
}

/**
 * Get current date/time in Kyiv timezone as a formatted string
 * Useful for forms that need to default to "now" in Kyiv time
 * @returns ISO-like string in Kyiv timezone (YYYY-MM-DDTHH:mm)
 */
export function getKyivNow(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: KYIV_TIMEZONE,
  });
  // Format: YYYY-MM-DD HH:mm -> convert to YYYY-MM-DDTHH:mm
  return formatter.format(now).replace(' ', 'T');
}

/**
 * Format date for datetime-local input (in Kyiv timezone)
 * @param date - Date string or Date object
 * @returns String formatted as YYYY-MM-DDTHH:mm for input[type="datetime-local"]
 */
export function formatDateTimeForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: KYIV_TIMEZONE,
  });
  // Format: YYYY-MM-DD HH:mm -> convert to YYYY-MM-DDTHH:mm
  return formatter.format(d).replace(' ', 'T');
}

/**
 * Format date/time showing both Kyiv and local time (for events/deadlines)
 * @param date - Date string or Date object
 * @param options - Formatting options
 * @returns String like "25 грудня, 18:00 (Київ) • 17:00 (ваш час)" or just Kyiv time if same
 */
export function formatDateTimeWithLocal(
  date: string | Date | null | undefined,
  options?: {
    showDate?: boolean;
    showYear?: boolean;
  }
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const { showDate = true, showYear = false } = options || {};

  // Get Kyiv time
  const kyivTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: KYIV_TIMEZONE,
  });
  const kyivTime = kyivTimeFormatter.format(d);

  // Get local time
  const localTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const localTime = localTimeFormatter.format(d);

  // Get Kyiv date if needed
  let dateStr = '';
  if (showDate) {
    const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
      day: 'numeric',
      month: 'long',
      ...(showYear ? { year: 'numeric' } : {}),
      timeZone: KYIV_TIMEZONE,
    });
    dateStr = dateFormatter.format(d) + ', ';
  }

  // Check if times are the same (user is in Kyiv timezone)
  if (kyivTime === localTime) {
    return `${dateStr}${kyivTime} (Київ)`;
  }

  return `${dateStr}${kyivTime} (Київ) • ${localTime} (ваш час)`;
}

/**
 * Format time showing both Kyiv and local time (short version for lists)
 * @param date - Date string or Date object
 * @returns String like "18:00 / 17:00" or just "18:00" if same timezone
 */
export function formatTimeWithLocal(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  // Get Kyiv time
  const kyivTime = new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: KYIV_TIMEZONE,
  }).format(d);

  // Get local time
  const localTime = new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);

  // Check if times are the same
  if (kyivTime === localTime) {
    return kyivTime;
  }

  return `${kyivTime} / ${localTime}`;
}

/**
 * Check if user is in Kyiv timezone
 * @returns boolean
 */
export function isUserInKyivTimezone(): boolean {
  const now = new Date();
  const kyivTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: KYIV_TIMEZONE,
  }).format(now);
  const localTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
  return kyivTime === localTime;
}

/**
 * Generate a random referral code
 * @returns 8-character referral code
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
