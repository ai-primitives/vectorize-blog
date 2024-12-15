import { describe, it, expect } from 'vitest'
import { generateEmbedding, storeBlogPost, findRelatedPosts } from '../vector'
import type { BlogPostInput } from '../../types/blog'
import type { Env } from '../../types/bindings'

declare global {
  var getMiniflareBindings: () => Env
}

describe('vector utilities', () => {
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
      const env = getMiniflareBindings()
      const embedding = await generateEmbedding(env, 'test text')
      expect(embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5])
    })
  })

  describe('storeBlogPost', () => {
    it('should store blog post with embeddings', async () => {
      const env = getMiniflareBindings()
      const result = await storeBlogPost(env, mockBlogPost)
      expect(result).toBeUndefined()
    })
  })

  describe('findRelatedPosts', () => {
    it('should find related posts using vector similarity', async () => {
      const env = getMiniflareBindings()
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
      const posts = await findRelatedPosts(env, embedding)
      expect(Array.isArray(posts)).toBe(true)
    })
  })
})
