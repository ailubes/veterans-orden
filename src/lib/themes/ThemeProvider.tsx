'use client';

/**
 * Theme Provider
 *
 * Provides theme configuration context AND light/dark mode switching.
 * Uses next-themes for SSR-safe theme toggling with localStorage persistence.
 */

import React, { createContext, useContext } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { themeConfig, type ThemeConfig } from '@config/theme.config';

const ThemeContext = createContext<ThemeConfig>(themeConfig);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <ThemeContext.Provider value={themeConfig}>
        <div className={`theme-${themeConfig.type}`} data-theme={themeConfig.type}>
          {children}
        </div>
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
