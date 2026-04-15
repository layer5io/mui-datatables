import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    loader: 'jsx',
    include: /.*\.[tj]sx?$/,
    exclude: [],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    globals: true,
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['test/**/*.test.js'],
    },
  },
})
