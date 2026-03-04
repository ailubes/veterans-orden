import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@config': path.resolve(__dirname, 'config'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.test.ts'],
    setupFiles: ['./__tests__/vitest.setup.ts'],
  },
});

