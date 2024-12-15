import type { Env } from '../types/bindings'
import type { BlogPostMeta, BlogPostInput } from '../types/blog'
import type { VectorizeMatch } from '../types/bindings'
import { formatBlogUrl } from '../types/blog'

export async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  const result = await env.AI.run('bge-small-en-v1.5', {
    prompt: text
  }) as { data: number[] }
  return result.data
}

export async function storeBlogPost(env: Env, input: BlogPostInput): Promise<void> {
  const embeddings = {
    title: await generateEmbedding(env, input.title),
    description: await generateEmbedding(env, input.description),
    tagline: await generateEmbedding(env, input.tagline),
    headline: await generateEmbedding(env, input.headline),
    subhead: await generateEmbedding(env, input.subhead),
    content: await generateEmbedding(env, input.content)
  }

  const url = formatBlogUrl(input.title)
  const metadata: BlogPostMeta = {
    ...input,
    url,
    embeddings
  }

  await env.BLOG_INDEX.upsert([{
    id: url,
    values: embeddings.title, // Use title embedding as primary vector
    metadata
  }])
}

export async function findRelatedPosts(env: Env, titleEmbedding: number[], limit: number = 6): Promise<BlogPostMeta[]> {
  const results = await env.BLOG_INDEX.query(titleEmbedding, { topK: limit })
  return results.matches.map((match: VectorizeMatch) => (match.metadata || {}) as unknown as BlogPostMeta)
}
