import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx/renderer'
import { streamSSR } from 'hono/jsx/streaming'
import { Suspense } from 'hono/jsx'
import type { FC } from 'hono/jsx'
import type { Env } from './types/bindings'
import { RootLayout } from './layouts/RootLayout'
import { Loading } from './components/Loading'

const app = new Hono<{ Bindings: Env }>()

// Configure JSX renderer with streaming support
app.use('*', jsxRenderer({
  stream: true,
  layout: RootLayout
}))

// Health check endpoint
app.get('/health', (c) => c.text('OK'))

// Root endpoint with streaming example
app.get('/', (c) => {
  return streamSSR(c, () => (
    <div class='prose lg:prose-xl mx-auto'>
      <h1>AI-Powered Blog</h1>
      <Suspense fallback={<Loading />}>
        <div>Content loading...</div>
      </Suspense>
    </div>
  ))
})

export default app
