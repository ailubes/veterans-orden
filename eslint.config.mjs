import nextConfig from 'eslint-config-next';

export default [
  ...nextConfig,
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    rules: {
      'import/no-anonymous-default-export': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-no-comment-textnodes': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/refs': 'warn',
    },
  },
  {
    ignores: [
      'mobile/**',
      'docs/**',
      'public/**',
      'assets/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
];
