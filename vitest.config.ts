import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: './database/test.db',
      DATABASE_CLIENT: 'sqlite',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
