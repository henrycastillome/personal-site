import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // Node environment: these suites cover pure logic. isomorphic-dompurify
    // brings its own jsdom, so lib/sanitize works here without a DOM env.
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // lcov is what sonar-scanner reads; text keeps the terminal useful.
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['lib/**/*.ts'],
      exclude: ['lib/types/**', 'lib/supabase/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
