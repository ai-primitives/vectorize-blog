import { html } from 'hono/html'
import type { Env } from '../types/bindings'
import type { BlogPostMeta } from '../types/blog'
import { generateEmbedding, findRelatedPosts } from '../utils/vector'

export const BlogGrid = async ({ env }: { env: Env }) => {
  try {
    const titleEmbedding = await generateEmbedding(env, '')
    const posts = await findRelatedPosts(env, titleEmbedding, 12)

    if (!posts.length) {
      return html`
        <div class="text-center py-12">
          <h2 class="text-2xl font-semibold text-gray-600">No blog posts found</h2>
          <p class="text-gray-500 mt-2">Check back later for new content</p>
        </div>
      `
    }

    return html`
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-8">Latest Blog Posts</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${posts.map(post => html`
            <a href="${post.url}"
               class="group block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <h2 class="text-xl font-semibold mb-2 group-hover:text-blue-600
                         group-focus:text-blue-600">${post.title}</h2>
              <p class="text-gray-600 mb-4 line-clamp-3">${post.description}</p>
              <div class="text-sm text-gray-500">
                <span class="font-medium">${post.tagline}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `
  } catch (error) {
    console.error('Error loading blog posts:', error)
    return html`
      <div class="text-center py-12">
        <h2 class="text-2xl font-semibold text-red-600 mb-2">Error loading blog posts</h2>
        <p class="text-gray-600">Please try again later</p>
      </div>
    `
  }
}
