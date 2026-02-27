/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Match web design tokens exactly
        bronze: '#b5793a',
        'bronze-2': '#8c5a25',
        steel: '#7d7d7d',
        'bg-950': '#0f1011',
        'panel-900': '#141618',
        'panel-850': '#1a1d20',
        'text-100': '#e7e7e7',
        'text-200': '#b9bcc2',
        'muted-300': '#a8acb3',
        'muted-400': '#9ca0a7',
        'muted-500': '#8b8f96',
        line: 'rgba(255,255,255,0.10)',
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-bold': ['Inter_700Bold'],
        'inter-black': ['Inter_900Black'],
        mono: ['IBMPlexMono_400Regular'],
        'mono-semibold': ['IBMPlexMono_600SemiBold'],
        'mono-bold': ['IBMPlexMono_700Bold'],
      },
    },
  },
  plugins: [],
};
