import { Hono } from 'hono'
import { generateAndStoreBlogPost } from '../utils/content'
import type { Env } from '../types/bindings'

const app = new Hono<{ Bindings: Env }>()

app.get('/robots.txt', async (c) => {
  try {
    // Create robots.txt content
    const robotsTxt = [
      'User-agent: *',
      'Allow: /',
      'Sitemap: https://example.com/sitemap.xml'
    ].join('\n')

    // Create response with proper headers
    const response = new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600'
      },
      status: 200
    })

    // Trigger background content generation
    const backgroundTask = async () => {
      try {
        await generateAndStoreBlogPost(c.env)
      } catch (error) {
        console.error('Background content generation failed:', error)
      }
    }

    // Register the background task with waitUntil
    if (c.env.executionCtx?.waitUntil) {
      c.env.executionCtx.waitUntil(backgroundTask())
    }

    return response
  } catch (error) {
    console.error('Error serving robots.txt:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})

export default app
