'use client';

/**
 * Theme Provider
 *
 * Provides theme configuration context to the entire application.
 * Injects CSS variables based on the theme config.
 */

import React, { createContext, useContext } from 'react';
import { themeConfig, type ThemeConfig } from '@config/theme.config';

const ThemeContext = createContext<ThemeConfig>(themeConfig);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={themeConfig}>
      <div className={`theme-${themeConfig.type}`} data-theme={themeConfig.type}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
