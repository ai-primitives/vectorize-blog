import type { Env } from '../types/bindings'
import type { BlogPostMeta, BlogPostInput } from '../types/blog'
import type { VectorizeMatch } from '../types/bindings'
import { formatBlogUrl } from '../types/blog'

export async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  const result = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [text]
  }) as { data: number[][] }
  return result.data[0]
}

export async function storeBlogPost(env: Env, input: BlogPostInput): Promise<void> {
  const url = formatBlogUrl(input.title)
  const metadata: BlogPostMeta = {
    title: input.title,
    description: input.description,
    tagline: input.tagline,
    headline: input.headline,
    subhead: input.subhead,
    content: input.content,
    url
  }

  await env.BLOG_INDEX.upsert([{
    id: url,
    values: input.embedding,
    metadata
  }])
}

export async function findRelatedPosts(env: Env, titleEmbedding: number[], limit: number = 6): Promise<BlogPostMeta[]> {
  const results = await env.BLOG_INDEX.query(titleEmbedding, { topK: limit })
  return results.matches.map((match: VectorizeMatch) => (match.metadata || {}) as unknown as BlogPostMeta)
}
