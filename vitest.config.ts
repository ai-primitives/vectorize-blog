import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.toml',
          modules: true,
          env: 'test',
          bindings: {
            AI: {
              run: async () => ({ data: [0.1, 0.2, 0.3, 0.4, 0.5] })
            },
            BLOG_INDEX: {
              query: async () => ({ matches: [] }),
              upsert: async () => ({ success: true })
            }
          }
        }
      }
    }
  }
})
