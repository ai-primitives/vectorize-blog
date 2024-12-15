import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'miniflare',
    environmentOptions: {
      modules: true,
      bindings: {
        AI: {
          name: 'AI',
          type: 'ai'
        },
        BLOG_INDEX: {
          name: 'BLOG_INDEX',
          type: 'vectorize'
        }
      }
    }
  }
})
