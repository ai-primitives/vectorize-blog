import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateBlogPostTitle, generateMetaContent, generateContent, generateAndStoreBlogPost } from '../content'
import { generateEmbedding, storeBlogPost } from '../vector'
import type { Env } from '../../types/bindings'
import type { BlogPostInput, GeneratedContent } from '../../types/blog'

vi.mock('../vector', () => ({
  generateEmbedding: vi.fn(),
  storeBlogPost: vi.fn()
}))

describe('content generation', () => {
  const mockEnv = global.getMiniflareBindings() as Env
  const mockEmbedding = [0.1, 0.2, 0.3]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(generateEmbedding).mockResolvedValue(mockEmbedding)
    vi.mocked(storeBlogPost).mockResolvedValue()
  })

  describe('generateBlogPostTitle', () => {
    it('should generate a blog post title', async () => {
      const title = await generateBlogPostTitle(mockEnv)
      expect(title).toBeTruthy()
      expect(typeof title).toBe('string')
      expect(title.length).toBeGreaterThan(0)
    })

    it('should handle AI model errors', async () => {
      vi.spyOn(mockEnv.AI, 'run').mockRejectedValueOnce(new Error('AI model error'))
      await expect(generateBlogPostTitle(mockEnv)).rejects.toThrow('Failed to generate blog post title')
    })
  })

  describe('generateMetaContent', () => {
    const title = 'Understanding Vector Embeddings in Modern AI'

    it('should generate meta content with proper structure', async () => {
      const meta = await generateMetaContent(mockEnv, title)
      expect(meta).toEqual(expect.objectContaining({
        title,
        description: expect.any(String),
        tagline: expect.any(String),
        headline: expect.any(String),
        subhead: expect.any(String)
      }))
    })

    it('should handle invalid JSON response', async () => {
      vi.spyOn(mockEnv.AI, 'run').mockResolvedValueOnce({ response: 'invalid json' })
      await expect(generateMetaContent(mockEnv, title)).rejects.toThrow('Failed to generate meta content')
    })

    it('should handle AI model errors', async () => {
      vi.spyOn(mockEnv.AI, 'run').mockRejectedValueOnce(new Error('AI model error'))
      await expect(generateMetaContent(mockEnv, title)).rejects.toThrow('Failed to generate meta content')
    })
  })

  describe('generateContent', () => {
    const mockMetadata: GeneratedContent = {
      title: 'Test Blog Post',
      description: 'Test description',
      tagline: 'Test tagline',
      headline: 'Test headline',
      subhead: 'Test subhead'
    }

    it('should generate blog post content', async () => {
      const content = await generateContent(mockEnv, mockMetadata.title, mockMetadata)
      expect(typeof content).toBe('string')
      expect(content.length).toBeGreaterThan(0)
    })

    it('should handle AI model errors', async () => {
      vi.spyOn(mockEnv.AI, 'run').mockRejectedValueOnce(new Error('AI model error'))
      await expect(generateContent(mockEnv, mockMetadata.title, mockMetadata))
        .rejects.toThrow('Failed to generate content')
    })
  })

  describe('generateAndStoreBlogPost', () => {
    it('should generate and store a complete blog post', async () => {
      await generateAndStoreBlogPost(mockEnv)

      expect(generateEmbedding).toHaveBeenCalled()
      expect(storeBlogPost).toHaveBeenCalledWith(
        mockEnv,
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          tagline: expect.any(String),
          headline: expect.any(String),
          subhead: expect.any(String),
          content: expect.any(String),
          embedding: mockEmbedding
        })
      )
    })

    it('should handle errors in the generation pipeline', async () => {
      vi.mocked(generateEmbedding).mockRejectedValueOnce(new Error('Embedding error'))
      await expect(generateAndStoreBlogPost(mockEnv)).rejects.toThrow('Failed to generate and store blog post')
    })

    it('should handle errors in the storage process', async () => {
      vi.mocked(storeBlogPost).mockRejectedValueOnce(new Error('Storage error'))
      await expect(generateAndStoreBlogPost(mockEnv)).rejects.toThrow('Failed to generate and store blog post')
    })
  })
})
