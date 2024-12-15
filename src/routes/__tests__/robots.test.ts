import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateAndStoreBlogPost } from '../../utils/content'
import app from '../robots'
import type { Env } from '../../types/bindings'
import type { ExecutionContext } from '@cloudflare/workers-types'

vi.mock('../../utils/content', () => ({
  generateAndStoreBlogPost: vi.fn()
}))

describe('robots.txt route', () => {
  let mockWaitUntil: ReturnType<typeof vi.fn>
  let mockEnv: Env & { executionCtx: ExecutionContext }

  beforeEach(() => {
    vi.clearAllMocks()
    mockWaitUntil = vi.fn((promise) => promise)
    vi.mocked(generateAndStoreBlogPost).mockResolvedValue()

    // Set up mock environment with execution context
    mockEnv = {
      AI: {
        run: vi.fn()
      },
      VECTORIZE_INDEX: {
        query: vi.fn(),
        upsert: vi.fn()
      },
      executionCtx: {
        waitUntil: mockWaitUntil,
        passThroughOnException: vi.fn()
      }
    } as unknown as Env & { executionCtx: ExecutionContext }
  })

  it('should return valid robots.txt content', async () => {
    const req = new Request('https://example.com/robots.txt')
    const res = await app.fetch(req, mockEnv)

    // Verify response content
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('User-agent: *')
    expect(text).toContain('Allow: /')
    expect(text).toContain('Sitemap: https://example.com/sitemap.xml')

    // Verify background task was triggered
    expect(mockWaitUntil).toHaveBeenCalledTimes(1)
    const waitUntilPromise = mockWaitUntil.mock.calls[0][0]
    expect(waitUntilPromise).toBeInstanceOf(Promise)

    // Wait for background task to complete
    await waitUntilPromise
    expect(generateAndStoreBlogPost).toHaveBeenCalledWith(mockEnv)
  })

  it('should trigger content generation in background', async () => {
    const req = new Request('https://example.com/robots.txt')
    await app.fetch(req, mockEnv)

    // Verify background task was triggered
    expect(mockWaitUntil).toHaveBeenCalledTimes(1)
    const waitUntilPromise = mockWaitUntil.mock.calls[0][0]
    expect(waitUntilPromise).toBeInstanceOf(Promise)

    // Wait for background task to complete
    await waitUntilPromise
    expect(generateAndStoreBlogPost).toHaveBeenCalledWith(mockEnv)
  })
})
