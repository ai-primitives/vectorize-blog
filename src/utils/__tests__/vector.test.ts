import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { unstable_dev } from 'wrangler'
import type { Unstable_DevWorker } from 'wrangler'
import type { BlogPostInput } from '../../types/blog'

interface StoreResponse {
  success: boolean
}

interface FindResponse {
  posts: BlogPostInput[]
}

describe('vector utilities', () => {
  let worker: Unstable_DevWorker

  const mockBlogPost: BlogPostInput = {
    title: 'Test Blog Post',
    description: 'A test blog post description',
    tagline: 'Test tagline',
    headline: 'Test Headline',
    subhead: 'Test Subhead',
    content: 'Test content'
  }

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true }
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  describe('blog post operations', () => {
    it('should store and retrieve blog posts', async () => {
      // Store blog post
      const storeResponse = await worker.fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBlogPost)
      })
      expect(storeResponse.status).toBe(200)
      const storeData = await storeResponse.json() as StoreResponse
      expect(storeData.success).toBe(true)

      // Find related posts
      const findResponse = await worker.fetch('/api/blog/related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: mockBlogPost.title })
      })
      expect(findResponse.status).toBe(200)
      const findData = await findResponse.json() as FindResponse
      expect(Array.isArray(findData.posts)).toBe(true)
    })
  })
})
