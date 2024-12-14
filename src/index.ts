/** @jsx jsx */
import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { renderToReadableStream, Suspense } from 'hono/jsx/streaming'
import type { Env } from './types/bindings'

const app = new Hono<Env>()

const Component = async () => {
  return <div>Hello World</div>
}

// Health check endpoint
app.get('/health', (c) => c.text('OK'))

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
