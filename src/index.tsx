import { Hono } from 'hono'
import { html } from 'hono/html'
import { renderToReadableStream, Suspense } from 'hono/jsx/streaming'
import type { Env } from './types/bindings'
import { storeBlogPost, findRelatedPosts, generateEmbedding } from './utils/vector'
import type { BlogPostInput, BlogPostMeta } from './types/blog'
import { RootLayout } from './layouts/RootLayout'
import { Loading } from './components/Loading'
import robotsRoute from './routes/robots'

const app = new Hono<{ Bindings: Env }>()

// Mount routes
app.route('/', robotsRoute)

// Health check endpoint
app.get('/health', (c) => c.text('OK'))

// Blog API endpoints
app.post('/api/blog', async (c) => {
  const blogPost = await c.req.json<BlogPostInput>()
  await storeBlogPost(c.env, blogPost)
  return c.json({ success: true })
})

app.post('/api/blog/related', async (c) => {
  const { title } = await c.req.json<{ title: string }>()
  const titleEmbedding = await generateEmbedding(c.env, title)
  const relatedPosts = await findRelatedPosts(c.env, titleEmbedding)
  return c.json({ posts: relatedPosts })
})

// Get all blog posts
app.get('/api/blog', async (c) => {
  const titleEmbedding = await generateEmbedding(c.env, '')
  const posts = await findRelatedPosts(c.env, titleEmbedding, 100)
  return c.json({ posts })
})

// Sitemap.xml endpoint
app.get('/sitemap.xml', async (c) => {
  const titleEmbedding = await generateEmbedding(c.env, '')
  const posts = await findRelatedPosts(c.env, titleEmbedding, 1000)

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${new URL('/', c.req.url).href}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${new URL(post.url, c.req.url).href}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`
  return c.text(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
})

// Blog post component
const BlogPost = async ({ title, env }: { title: string; env: Env }) => {
  const titleEmbedding = await generateEmbedding(env, title)
  const relatedPosts = await findRelatedPosts(env, titleEmbedding)
  return html`
    <article class="prose lg:prose-xl mx-auto">
      <h1>${title}</h1>
      <div class="mt-8">
        <!-- Blog content will be rendered here -->
      </div>
      <div class="mt-12 border-t pt-8">
        <h2 class="text-2xl font-bold mb-4">Related Posts</h2>
        <div class="grid grid-cols-2 gap-4">
          ${relatedPosts.slice(0, 6).map(post => html`
            <a href="${post.url}" class="p-4 border rounded hover:bg-gray-50">
              <h3 class="font-semibold">${post.title}</h3>
              <p class="text-sm text-gray-600 mt-1">${post.description}</p>
            </a>
          `).join('')}
        </div>
      </div>
    </article>
  `
}

// Blog post route
app.get('/blog/:title', async (c) => {
  const title = decodeURIComponent(c.req.param('title').replace(/_/g, ' '))
  const stream = renderToReadableStream(
    <RootLayout>
      <Suspense fallback={<Loading />}>
        <BlogPost title={title} env={c.env} />
      </Suspense>
    </RootLayout>
  )
  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})

// Blog post grid component
const BlogGrid = async ({ env }: { env: Env }) => {
  const titleEmbedding = await generateEmbedding(env, '')
  const posts = await findRelatedPosts(env, titleEmbedding, 12)

  return html`
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">Latest Blog Posts</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${posts.map(post => html`
          <a href="${post.url}" class="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow">
            <h2 class="text-xl font-semibold mb-2">${post.title}</h2>
            <p class="text-gray-600 mb-4">${post.description}</p>
            <div class="text-sm text-gray-500">
              <span class="font-medium">${post.tagline}</span>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `
}

// Root endpoint
app.get('/', (c) => {
  const stream = renderToReadableStream(
    <RootLayout>
      <Suspense fallback={<Loading />}>
        <BlogGrid env={c.env} />
      </Suspense>
    </RootLayout>
  )
  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})

export default app
