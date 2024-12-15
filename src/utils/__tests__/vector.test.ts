import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateEmbedding, storeBlogPost, findRelatedPosts } from '../vector'
import { formatBlogUrl } from '../../types/blog'
import type { BlogPostInput } from '../../types/blog'
import type { Env } from '../../types/bindings'

describe('vector utilities', () => {
  const mockEnv = {
    AI: {
      run: vi.fn()
    },
    BLOG_INDEX: {
      query: vi.fn(),
      upsert: vi.fn()
    }
  } as unknown as Env

  const mockBlogPost: BlogPostInput = {
    title: 'Test Blog Post',
    description: 'A test blog post description',
    tagline: 'Test tagline',
    headline: 'Test Headline',
    subhead: 'Test Subhead',
    content: 'Test content'
  }

  const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]

  beforeEach(() => {
    vi.clearAllMocks()
    mockEnv.AI.run.mockResolvedValue({ data: mockEmbedding })
    mockEnv.BLOG_INDEX.query.mockResolvedValue({
      matches: [{
        id: formatBlogUrl(mockBlogPost.title),
        score: 0.95,
        metadata: {
          ...mockBlogPost,
          url: formatBlogUrl(mockBlogPost.title),
          embeddings: {
            title: mockEmbedding,
            description: mockEmbedding,
            tagline: mockEmbedding,
            headline: mockEmbedding,
            subhead: mockEmbedding,
            content: mockEmbedding
          }
        }
      }]
    })
  })

  describe('generateEmbedding', () => {
    it('should generate embeddings using the correct model', async () => {
      const result = await generateEmbedding(mockEnv, 'test text')
      expect(mockEnv.AI.run).toHaveBeenCalledWith('bge-small-en-v1.5', {
        prompt: 'test text'
      })
      expect(result).toEqual(mockEmbedding)
    })
  })

  describe('storeBlogPost', () => {
    it('should store blog post with correct metadata and embeddings', async () => {
      await storeBlogPost(mockEnv, mockBlogPost)

      expect(mockEnv.BLOG_INDEX.upsert).toHaveBeenCalledWith([{
        id: formatBlogUrl(mockBlogPost.title),
        values: mockEmbedding,
        metadata: {
          ...mockBlogPost,
          url: formatBlogUrl(mockBlogPost.title),
          embeddings: {
            title: mockEmbedding,
            description: mockEmbedding,
            tagline: mockEmbedding,
            headline: mockEmbedding,
            subhead: mockEmbedding,
            content: mockEmbedding
          }
        }
      }])
    })
  })

  describe('findRelatedPosts', () => {
    it('should return related posts based on title embedding', async () => {
      const result = await findRelatedPosts(mockEnv, mockEmbedding)

      expect(mockEnv.BLOG_INDEX.query).toHaveBeenCalledWith(mockEmbedding, { topK: 6 })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        ...mockBlogPost,
        url: formatBlogUrl(mockBlogPost.title),
        embeddings: {
          title: mockEmbedding,
          description: mockEmbedding,
          tagline: mockEmbedding,
          headline: mockEmbedding,
          subhead: mockEmbedding,
          content: mockEmbedding
        }
      })
    })
  })
})
