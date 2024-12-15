import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateEmbedding, storeBlogPost, findRelatedPosts } from '../vector'
import type { BlogPostInput } from '../../types/blog'
import type { Env } from '../../types/bindings'

vi.mock('@cloudflare/ai', () => ({
  Ai: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockImplementation((model, input) => {
      if (model === '@cf/baai/bge-base-en-v1.5') {
        return Promise.resolve({ data: [[0.1, 0.2, 0.3, 0.4, 0.5]] })
      }
      return Promise.resolve({ response: 'mocked response' })
    })
  }))
}))

describe('vector utilities', () => {
  const mockBlogPost: BlogPostInput = {
    title: 'Test Blog Post',
    description: 'A test blog post description',
    tagline: 'Test tagline',
    headline: 'Test Headline',
    subhead: 'Test Subhead',
    content: 'Test content',
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateEmbedding', () => {
    it('should generate embeddings using AI model', async () => {
      const env = getMiniflareBindings()
      const embedding = await generateEmbedding(env, 'test text')
      expect(embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5])
    })

    it('should handle AI model errors', async () => {
      const env = getMiniflareBindings()
      vi.spyOn(env.AI, 'run').mockRejectedValueOnce(new Error('Model failed'))
      await expect(generateEmbedding(env, 'test text')).rejects.toThrow('AI model error')
    })
  })

  describe('storeBlogPost', () => {
    it('should store blog post with embeddings', async () => {
      const env = getMiniflareBindings()
      await storeBlogPost(env, mockBlogPost)
      expect(env.BLOG_INDEX.upsert).toHaveBeenCalledWith([{
        id: expect.any(String),
        values: mockBlogPost.embedding,
        metadata: expect.objectContaining({
          title: mockBlogPost.title,
          description: mockBlogPost.description,
          tagline: mockBlogPost.tagline,
          headline: mockBlogPost.headline,
          subhead: mockBlogPost.subhead,
          content: mockBlogPost.content
        })
      }])
    })

    it('should handle storage errors', async () => {
      const env = getMiniflareBindings()
      vi.spyOn(env.BLOG_INDEX, 'upsert').mockRejectedValueOnce(new Error('Database error'))
      await expect(storeBlogPost(env, mockBlogPost)).rejects.toThrow('Storage error')
    })
  })

  describe('findRelatedPosts', () => {
    it('should find related posts using vector similarity', async () => {
      const env = getMiniflareBindings()
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
      const posts = await findRelatedPosts(env, embedding)
      expect(Array.isArray(posts)).toBe(true)
      expect(posts).toHaveLength(2)
      expect(posts[0]).toHaveProperty('title', 'Test Post 1')
      expect(posts[1]).toHaveProperty('title', 'Test Post 2')
    })

    it('should handle query errors', async () => {
      const env = getMiniflareBindings()
      vi.spyOn(env.BLOG_INDEX, 'query').mockRejectedValueOnce(new Error('Search failed'))
      await expect(findRelatedPosts(env, [0.1, 0.2, 0.3])).rejects.toThrow('Query error')
    })
  })
})
