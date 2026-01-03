/**
 * useTheme Hook
 *
 * Provides easy access to theme configuration throughout the application.
 */

import { themeConfig } from '@/../../config/theme.config';

export function useTheme() {
  return {
    type: themeConfig.type,
    colors: themeConfig.colors,
    fonts: themeConfig.fonts,
    elements: themeConfig.elements,
    layout: themeConfig.layout,
    borderRadius: themeConfig.borderRadius,
    shadows: themeConfig.shadows,
    transitions: themeConfig.transitions,
  };
}

// Export theme config for direct access
export { themeConfig };
