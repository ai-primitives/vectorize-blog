import { beforeAll } from 'vitest'
import type { Env } from './src/types/bindings'

declare global {
  var getMiniflareBindings: () => Env
}

beforeAll(() => {
  global.getMiniflareBindings = () => ({
    AI: {
      run: async () => ({ data: [0.1, 0.2, 0.3, 0.4, 0.5] })
    },
    BLOG_INDEX: {
      query: async () => ({ matches: [] }),
      upsert: async () => ({ success: true })
    }
  })
})
