import { beforeAll, afterAll, vi } from 'vitest'
import type { Env } from '../types/bindings'
import type { ExecutionContext } from '@cloudflare/workers-types'

declare global {
  // eslint-disable-next-line no-var
  var getMiniflareBindings: () => Env
  var getMockExecutionContext: () => ExecutionContext
}

const mockAI = {
  run: vi.fn().mockImplementation((model: string, input: any) => {
    if (model === '@cf/baai/bge-base-en-v1.5') {
      return Promise.resolve({ data: [[0.1, 0.2, 0.3, 0.4, 0.5]] })
    }
    return Promise.resolve({ response: 'mocked response' })
  })
}

const mockVectorize = {
  query: vi.fn().mockResolvedValue({
    matches: [
      { id: '1', score: 0.9, metadata: { title: 'Test Post 1' } },
      { id: '2', score: 0.8, metadata: { title: 'Test Post 2' } }
    ]
  }),
  upsert: vi.fn().mockResolvedValue(undefined)
}

const mockEnv: Env = {
  AI: mockAI as any,
  BLOG_INDEX: mockVectorize as any
}

const mockExecutionContext = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn()
}

beforeAll(() => {
  vi.mock('@cloudflare/ai', () => ({
    Ai: vi.fn().mockImplementation(() => mockAI)
  }))

  // @ts-ignore - getMiniflareBindings is added at runtime
  global.getMiniflareBindings = () => mockEnv
  // @ts-ignore - getMockExecutionContext is added at runtime
  global.getMockExecutionContext = () => mockExecutionContext
})

afterAll(() => {
  vi.clearAllMocks()
  // @ts-ignore - getMiniflareBindings is removed at runtime
  global.getMiniflareBindings = undefined
  // @ts-ignore - getMockExecutionContext is removed at runtime
  global.getMockExecutionContext = undefined
})
