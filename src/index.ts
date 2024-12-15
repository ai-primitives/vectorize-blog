/** @jsx jsx */
import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { renderToReadableStream, Suspense } from 'hono/jsx/streaming'
import type { Env } from './types/bindings'
import { storeBlogPost, findRelatedPosts, generateEmbedding } from './utils/vector'
import type { BlogPostInput } from './types/blog'

const app = new Hono<Env>()

const Component = async () => {
  return <div>Hello World</div>
}

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

// Robots.txt endpoint
app.get('/robots.txt', (c) => {
  const robotsTxt = `
User-agent: *
Allow: /
Sitemap: ${new URL('/sitemap.xml', c.req.url).href}
`.trim()
  return c.text(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
})

// Sitemap.xml endpoint
app.get('/sitemap.xml', async (c) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${new URL('/', c.req.url).href}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
  return c.text(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
})

// Root endpoint
app.get('/', (c) => {
  const stream = renderToReadableStream(
    <html>
      <body>
        <Suspense fallback={<div>loading...</div>}>
          <Component />
        </Suspense>
      </body>
    </html>
  )
  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})

export default app
