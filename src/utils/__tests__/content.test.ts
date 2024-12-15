import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Ai } from '@cloudflare/ai'
import { generateBlogPostTitle, generateMetaContent, generateContent, generateAndStoreBlogPost } from '../content'
import { generateEmbedding, storeBlogPost } from '../vector'
import type { Env } from '../../types/bindings'
import type { GeneratedContent } from '../../types/blog'

// Mock the vector utilities
vi.mock('../vector', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Float32Array(10)),
  storeBlogPost: vi.fn().mockResolvedValue(undefined)
}))

// Mock Ai class
vi.mock('@cloudflare/ai', () => ({
  Ai: vi.fn(() => ({
    run: vi.fn()
  }))
}))

// Mock data
const mockTitle = 'Understanding Vector Embeddings in Modern AI'
const mockMetaContent: GeneratedContent = {
  title: mockTitle,
  description: 'Learn how vector embeddings are revolutionizing AI applications.',
  tagline: 'Transforming Data into Meaningful Representations',
  headline: 'Vector Embeddings: The Future of AI',
  subhead: 'Discover how modern AI systems leverage vector embeddings for enhanced performance'
}
const mockContent = 'This is a test blog post content.'

// Test environment setup
const mockAiInstance = { run: vi.fn() }
vi.mocked(Ai).mockImplementation(() => mockAiInstance as any)

const mockEnv: Env = {
  AI: mockAiInstance as any,  // Use mock instance directly
  VECTORIZE_INDEX: {} as any,
  VECTORIZE_API_KEY: 'test-key'
}

describe('content generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAiInstance.run.mockReset()
  })

  describe('generateBlogPostTitle', () => {
    it('should generate a blog post title', async () => {
      mockAiInstance.run.mockResolvedValueOnce({ response: mockTitle })
      const title = await generateBlogPostTitle(mockEnv)
      expect(title).toBe(mockTitle)
      expect(mockAiInstance.run).toHaveBeenCalledWith('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: expect.any(String) }
        ]
      })
    })

    it('should handle AI model errors', async () => {
      mockAiInstance.run.mockRejectedValueOnce(new Error('AI model error'))
      await expect(generateBlogPostTitle(mockEnv))
        .rejects.toThrow('Failed to generate blog post title')
    })
  })

  describe('generateMetaContent', () => {
    const mockMetaResponse = {
      description: mockMetaContent.description,
      tagline: mockMetaContent.tagline,
      headline: mockMetaContent.headline,
      subhead: mockMetaContent.subhead
    }

    it('should generate meta content with proper structure', async () => {
      mockAiInstance.run.mockResolvedValueOnce({
        response: JSON.stringify(mockMetaResponse)
      })
      const meta = await generateMetaContent(mockEnv, mockTitle)
      expect(meta).toEqual(mockMetaContent)
      expect(mockAiInstance.run).toHaveBeenCalledWith('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: expect.any(String) }
        ]
      })
    })

    it('should handle AI model errors', async () => {
      mockAiInstance.run.mockRejectedValueOnce(new Error('AI model error'))
      await expect(generateMetaContent(mockEnv, mockTitle))
        .rejects.toThrow('Failed to generate meta content')
    })

    it('should handle invalid JSON responses', async () => {
      mockAiInstance.run.mockResolvedValueOnce({
        response: 'invalid json'
      })
      await expect(generateMetaContent(mockEnv, mockTitle))
        .rejects.toThrow('Failed to generate meta content: Invalid JSON in AI response')
    })
  })

  describe('generateContent', () => {
    it('should generate blog post content', async () => {
      mockAiInstance.run.mockResolvedValueOnce({
        response: mockContent
      })
      const content = await generateContent(mockEnv, mockTitle, mockMetaContent)
      expect(content).toBe(mockContent)
      expect(mockAiInstance.run).toHaveBeenCalledWith('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: expect.any(String) }
        ]
      })
    })

    it('should handle AI model errors', async () => {
      mockAiInstance.run.mockRejectedValueOnce(new Error('AI model error'))
      await expect(generateContent(mockEnv, mockTitle, mockMetaContent))
        .rejects.toThrow('Failed to generate content')
    })
  })

  describe('generateAndStoreBlogPost', () => {
    const mockMetaResponse = {
      description: mockMetaContent.description,
      tagline: mockMetaContent.tagline,
      headline: mockMetaContent.headline,
      subhead: mockMetaContent.subhead
    }

    it('should generate and store a complete blog post', async () => {
      // Mock successful responses for each step
      mockAiInstance.run
        .mockResolvedValueOnce({ response: mockTitle })
        .mockResolvedValueOnce({ response: JSON.stringify(mockMetaResponse) })
        .mockResolvedValueOnce({ response: mockContent })

      await generateAndStoreBlogPost(mockEnv)

      expect(mockAiInstance.run).toHaveBeenCalledTimes(3)
      expect(generateEmbedding).toHaveBeenCalledWith(mockEnv, mockTitle)
      expect(storeBlogPost).toHaveBeenCalledWith(mockEnv, expect.objectContaining({
        title: mockTitle,
        content: mockContent,
        description: mockMetaContent.description,
        tagline: mockMetaContent.tagline,
        headline: mockMetaContent.headline,
        subhead: mockMetaContent.subhead
      }))
    })

    it('should handle errors in the generation pipeline', async () => {
      mockAiInstance.run.mockRejectedValueOnce(new Error('AI model error'))
      await expect(generateAndStoreBlogPost(mockEnv))
        .rejects.toThrow('Failed to generate blog post title')
    })

    it('should handle errors in the storage process', async () => {
      // Mock successful responses for generation steps
      mockAiInstance.run
        .mockResolvedValueOnce({ response: mockTitle })
        .mockResolvedValueOnce({ response: JSON.stringify(mockMetaResponse) })
        .mockResolvedValueOnce({ response: mockContent })

      // Mock storage error
      vi.mocked(storeBlogPost).mockRejectedValueOnce(new Error('Storage error'))

      await expect(generateAndStoreBlogPost(mockEnv))
        .rejects.toThrow('Failed to generate and store blog post')
    })
  })
})
