import { Hono } from 'hono'
import type { Env } from '../types/bindings'
import { generateAndStoreBlogPost } from '../utils/content'

const app = new Hono<{ Bindings: Env }>()

app.get('/robots.txt', async (c) => {
  // Trigger background content generation
  c.executionCtx.waitUntil(generateAndStoreBlogPost(c.env))

  // Return standard robots.txt content
  return c.text(`User-agent: *
Allow: /
Sitemap: ${new URL('/sitemap.xml', c.req.url).href}`)
})

export default app
