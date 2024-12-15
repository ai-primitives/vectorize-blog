import { describe, it, expect, vi } from 'vitest'
import { generateAndStoreBlogPost } from '../../utils/content'
import app from '../robots'
import type { Env } from '../../types/bindings'

vi.mock('../../utils/content', () => ({
  generateAndStoreBlogPost: vi.fn()
}))

describe('robots.txt route', () => {
  const mockEnv = global.getMiniflareBindings() as Env
  const baseUrl = 'http://localhost:8787'

  it('should return valid robots.txt content', async () => {
    const res = await app.fetch(new Request(`${baseUrl}/robots.txt`), {
      env: mockEnv
    })

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('User-agent: *')
    expect(text).toContain('Allow: /')
    expect(text).toContain('Sitemap:')
  })

  it('should trigger content generation in background', async () => {
    await app.fetch(new Request(`${baseUrl}/robots.txt`), {
      env: mockEnv
    })

    expect(generateAndStoreBlogPost).toHaveBeenCalledWith(mockEnv)
  })
})
