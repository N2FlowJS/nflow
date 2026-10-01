import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // tsc emits compiled copies of these files under dist/ (rootDir is the
    // repository root), and those must not be collected a second time.
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});