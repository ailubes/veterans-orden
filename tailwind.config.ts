import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			// Theme colors from config
  			canvas: '#e8e6e1',
  			'timber-dark': '#1a1a1a',
  			'timber-beam': '#3a3a3a',
  			accent: {
  				DEFAULT: '#8b6f47',
  				foreground: '#e8e6e1'
  			},
  			grain: '#e8e6e1',
  			joint: '#1a1816',
  			'grid-line': 'rgba(125, 125, 125, 0.2)',
  			// Brutalist theme colors
  			'concrete-dark': '#2a2a2a',
  			'concrete-mid': '#3a3a3a',
  			rust: '#cc4e2c',
  			steel: '#7d7d7d',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			syne: ['Inter', 'sans-serif'],
  			mono: ['IBM Plex Mono', 'monospace'],
  		},
  		fontSize: {
  			hero: [
  				'clamp(48px, 7vw, 100px)',
  				{
  					lineHeight: '0.9',
  					letterSpacing: '-0.04em'
  				}
  			],
  			section: [
  				'clamp(36px, 6vw, 72px)',
  				{
  					lineHeight: '0.95',
  					letterSpacing: '-0.04em'
  				}
  			],
  			'card-title': [
  				'32px',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.02em'
  				}
  			],
  			subsection: [
  				'28px',
  				{
  					lineHeight: '1.2',
  					letterSpacing: '-0.02em'
  				}
  			],
  			'body-large': [
  				'18px',
  				{
  					lineHeight: '1.6'
  				}
  			],
  			body: [
  				'16px',
  				{
  					lineHeight: '1.6'
  				}
  			],
  			'body-small': [
  				'14px',
  				{
  					lineHeight: '1.6'
  				}
  			],
  			caption: [
  				'12px',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			label: [
  				'10px',
  				{
  					lineHeight: '1.4',
  					letterSpacing: '0.2em'
  				}
  			],
  			micro: [
  				'11px',
  				{
  					lineHeight: '1.4'
  				}
  			]
  		},
  		spacing: {
  			xs: '10px',
  			sm: '20px',
  			md: '30px',
  			lg: '40px',
  			xl: '60px',
  			'2xl': '80px',
  			'3xl': '100px'
  		},
  		maxWidth: {
  			container: '1600px'
  		},
  		transitionTimingFunction: {
  			timber: 'cubic-bezier(0.23, 1, 0.32, 1)'
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'rotate(-5deg) translate(0, 0)'
  				},
  				'50%': {
  					transform: 'rotate(-5deg) translate(10px, -10px)'
  				}
  			}
  		},
  		animation: {
  			float: 'float 6s ease-in-out infinite'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
