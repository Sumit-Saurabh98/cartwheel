import { defineConfig } from 'vitest/config';

// API tests only; the storefront in web/ has its own package.
export default defineConfig({
  test: { include: ['test/**/*.test.js'] },
});
