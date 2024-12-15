import { describe, it, expect } from 'vitest'
import { generateEmbedding, storeBlogPost, findRelatedPosts } from '../vector'
import type { BlogPostInput } from '../../types/blog'
import type { Env } from '../../types/bindings'

describe('vector utilities', () => {
  const mockEnv: Env = {
    AI: {
      run: async () => ({ data: [0.1, 0.2, 0.3, 0.4, 0.5] })
    },
    BLOG_INDEX: {
      query: async () => ({ matches: [] }),
      upsert: async () => ({ success: true })
    }
  }

  const mockBlogPost: BlogPostInput = {
    title: 'Test Blog Post',
    description: 'A test blog post description',
    tagline: 'Test tagline',
    headline: 'Test Headline',
    subhead: 'Test Subhead',
    content: 'Test content'
  }

  describe('generateEmbedding', () => {
    it('should generate embeddings using AI model', async () => {
      const embedding = await generateEmbedding(mockEnv, 'test text')
      expect(embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5])
    })
  })

  describe('storeBlogPost', () => {
    it('should store blog post with embeddings', async () => {
      const result = await storeBlogPost(mockEnv, mockBlogPost)
      expect(result).toBeDefined()
    })
  })

  describe('findRelatedPosts', () => {
    it('should find related posts using vector similarity', async () => {
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
      const posts = await findRelatedPosts(mockEnv, embedding)
      expect(Array.isArray(posts)).toBe(true)
    })
  })
})
