import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.toml',
          modules: true,
          vars: {
            ENVIRONMENT: 'test'
          },
          bindings: {
            AI: {
              run: async (model: string, { prompt }: { prompt: string }) => {
                return { data: [0.1, 0.2, 0.3, 0.4, 0.5] }
              }
            },
            BLOG_INDEX: {
              query: async (vector: number[], options: { topK: number }) => {
                return { matches: [] }
              },
              upsert: async (vectors: Array<{ id: string, values: number[], metadata: any }>) => {
                return { success: true }
              }
            }
          }
        }
      }
    }
  }
})
