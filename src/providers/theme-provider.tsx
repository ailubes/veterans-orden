'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

/**
 * Theme Provider - Wraps the app with next-themes for light/dark mode support
 *
 * Features:
 * - SSR-safe (no flash on load)
 * - localStorage persistence
 * - Dark theme as default (no class)
 * - Light theme via .light class
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={['light', 'dark']}
      value={{
        light: 'light',
        dark: '', // No class for dark theme (it's the CSS default)
      }}
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
