import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with thousands separators
 * Example: 1000 -> 1,000
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('uk-UA');
}
