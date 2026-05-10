import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'ecmascript',
          jsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup-vitest.js'],
    globals: true,
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['test/**/*.test.js'],
      thresholds: {
        lines: 55,
        statements: 50,
        functions: 50,
        branches: 50,
      },
    },
  },
})
