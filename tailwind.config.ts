import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f1eb',
        'timber-dark': '#2c2824',
        'timber-beam': '#4a4238',
        accent: '#d45d3a',
        grain: '#e8e2d6',
        joint: '#1a1816',
        'grid-line': 'rgba(74, 66, 56, 0.15)',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(48px, 7vw, 100px)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'section': ['clamp(36px, 6vw, 72px)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'card-title': ['32px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'subsection': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'body-large': ['18px', { lineHeight: '1.6' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'body-small': ['14px', { lineHeight: '1.6' }],
        'caption': ['12px', { lineHeight: '1.5' }],
        'label': ['10px', { lineHeight: '1.4', letterSpacing: '0.2em' }],
        'micro': ['11px', { lineHeight: '1.4' }],
      },
      spacing: {
        'xs': '10px',
        'sm': '20px',
        'md': '30px',
        'lg': '40px',
        'xl': '60px',
        '2xl': '80px',
        '3xl': '100px',
      },
      maxWidth: {
        'container': '1600px',
      },
      transitionTimingFunction: {
        'timber': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'rotate(-5deg) translate(0, 0)' },
          '50%': { transform: 'rotate(-5deg) translate(10px, -10px)' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
