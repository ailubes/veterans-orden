/**
 * Theme Configuration
 *
 * Defines the design system for Order of Veterans.
 * Uses an industrial/brutalist aesthetic with concrete, steel, and bronze accents.
 */

export type ThemeType = 'timber' | 'brutalist';

export const themeConfig = {
  // Theme type
  type: 'brutalist' as ThemeType,

  // Color palette - Industrial/Brutalist
  colors: {
    // Backgrounds
    canvas: '#e8e6e1',          // Light concrete texture
    'concrete-dark': '#2a2a2a',  // Dark concrete (primary background)
    'concrete-mid': '#3a3a3a',   // Mid-tone concrete

    // Text and primary elements
    primary: '#1a1a1a',          // Deep black (text on light)
    'primary-light': '#e8e6e1',  // Light text (on dark backgrounds)

    // Accent colors
    accent: '#8b6f47',           // Bronze/copper (primary accent)
    'accent-hover': '#a5855a',   // Lighter bronze (hover states)
    rust: '#cc4e2c',             // Rust red (secondary accent)
    steel: '#7d7d7d',            // Steel gray (tertiary)

    // Structural elements
    joint: '#1a1816',            // Darkest (structural joints)
    'grid-line': 'rgba(125, 125, 125, 0.2)', // Subtle grid lines
    rebar: 'rgba(205, 78, 44, 0.15)', // Rebar pattern overlay
  },

  // Typography
  fonts: {
    heading: {
      family: 'Inter, sans-serif',
      googleFont: 'Inter:wght@700;900',
      weight: {
        normal: 700,
        bold: 900,
      },
    },
    body: {
      family: 'IBM Plex Mono, monospace',
      googleFont: 'IBM Plex Mono:wght@400;600',
      weight: {
        normal: 400,
        bold: 600,
      },
    },
  },

  // Design elements
  elements: {
    // Timber-specific elements (disabled for brutalist)
    joints: false,   // No decorative corner joints
    beams: false,    // No vertical wood beams
    grain: false,    // No wood grain overlay

    // Brutalist-specific elements
    concrete: true,  // Concrete texture overlay
    rebar: true,     // Steel rebar pattern
    industrial: true, // Industrial structural elements
  },

  // Layout settings
  layout: {
    grid: {
      desktop: '80px 1fr 1fr 1fr 80px',
      mobile: '20px 1fr 20px',
    },
    maxWidth: '1600px',
    spacing: {
      xs: '10px',
      sm: '20px',
      md: '30px',
      lg: '40px',
      xl: '60px',
      '2xl': '80px',
      '3xl': '100px',
    },
  },

  // Border radius (minimal for brutalist aesthetic)
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '6px',
  },

  // Shadows (subtle, industrial)
  shadows: {
    sm: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    md: '4px 4px 8px rgba(0, 0, 0, 0.3)',
    lg: '8px 8px 16px rgba(0, 0, 0, 0.4)',
    industrial: '50px 50px 100px rgba(0, 0, 0, 0.5)', // Heavy shadow for depth
  },

  // Transitions
  transitions: {
    default: 'all 0.3s ease',
    slow: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  },
} as const;

export type ThemeConfig = typeof themeConfig;
