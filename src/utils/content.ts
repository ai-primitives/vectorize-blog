import { Ai } from '@cloudflare/ai'
import type { Env } from '../types/bindings'
import type { BlogPostInput, GeneratedContent } from '../types/blog'
import { generateEmbedding, storeBlogPost } from './vector'

interface AIError extends Error {
  message: string
  cause?: unknown
}

class ContentGenerationError extends Error {
  constructor(message: string, public step: string, public cause?: unknown) {
    super(message)
    this.name = 'ContentGenerationError'
  }
}

const systemPrompt = `You are a technical blog post generator. Your responses should be clear, informative, and engaging.
Focus on accuracy and practical examples when discussing technical topics.`

const titlePrompt = `Generate a blog post title about technology, AI, or software development.
The title should be engaging and SEO-friendly.
Format: Return only the title, no quotes or additional text.
Example output: 10 Ways AI is Transforming Software Development in 2024`

const metaPrompt = (title: string) => `Given the blog post title "${title}", generate the following meta content:
1. Description (150-160 characters)
2. Tagline (short, punchy phrase)
3. Headline (attention-grabbing H1)
4. Subhead (supporting text under headline)

Format the response as JSON with these exact keys:
{
  "description": "...",
  "tagline": "...",
  "headline": "...",
  "subhead": "..."
}`

const contentPrompt = (title: string, metadata: GeneratedContent) => `Write a comprehensive blog post about "${title}".
Use the following metadata as context:
- Description: ${metadata.description}
- Tagline: ${metadata.tagline}
- Headline: ${metadata.headline}
- Subhead: ${metadata.subhead}

Format: Write in markdown format with proper headings, paragraphs, and code examples where relevant.
Length: Aim for 1000-1500 words of engaging, informative content.
Style: Professional but conversational, with clear explanations and practical examples.`

export async function generateBlogPostTitle(env: Env): Promise<string> {
  try {
    const ai = new Ai(env.AI)
    const result = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: titlePrompt }
      ]
    })
    if (typeof result !== 'object' || !result || !('response' in result) || typeof result.response !== 'string') {
      throw new Error('Invalid AI response format')
    }
    return result.response.trim()
  } catch (error) {
    const aiError = error as AIError
    throw new ContentGenerationError(`Failed to generate blog post title: ${aiError.message}`, 'title', aiError.cause)
  }
}

export async function generateMetaContent(env: Env, title: string): Promise<GeneratedContent> {
  try {
    const ai = new Ai(env.AI)
    const result = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: metaPrompt(title) }
      ]
    })
    if (typeof result !== 'object' || !result || !('response' in result) || typeof result.response !== 'string') {
      throw new Error('Invalid AI response format')
    }
    try {
      const metaContent = JSON.parse(result.response) as Omit<GeneratedContent, 'title'>
      return {
        title,
        ...metaContent
      }
    } catch (parseError) {
      throw new Error(`Invalid JSON in AI response: ${(parseError as Error).message}`)
    }
  } catch (error) {
    const aiError = error as AIError
    throw new ContentGenerationError(`Failed to generate meta content: ${aiError.message}`, 'meta', aiError.cause)
  }
}

export async function generateContent(env: Env, title: string, metadata: GeneratedContent): Promise<string> {
  try {
    const ai = new Ai(env.AI)
    const result = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contentPrompt(title, metadata) }
      ]
    })
    if (typeof result !== 'object' || !result || !('response' in result) || typeof result.response !== 'string') {
      throw new Error('Invalid AI response format')
    }
    return result.response.trim()
  } catch (error) {
    const aiError = error as AIError
    throw new ContentGenerationError(`Failed to generate content: ${aiError.message}`, 'content', aiError.cause)
  }
}

export async function generateAndStoreBlogPost(env: Env): Promise<void> {
  try {
    const title = await generateBlogPostTitle(env)
    const metaContent = await generateMetaContent(env, title)
    const [embedding, content] = await Promise.all([
      generateEmbedding(env, title),
      generateContent(env, title, metaContent)
    ])

    const blogPost: BlogPostInput = {
      title,
      description: metaContent.description,
      tagline: metaContent.tagline,
      headline: metaContent.headline,
      subhead: metaContent.subhead,
      content,
      embedding
    }

    await storeBlogPost(env, blogPost)
  } catch (error) {
    if (error instanceof ContentGenerationError) {
      throw error
    }
    const aiError = error as AIError
    throw new ContentGenerationError(`Failed to generate and store blog post: ${aiError.message}`, 'storage', aiError.cause)
  }
}
