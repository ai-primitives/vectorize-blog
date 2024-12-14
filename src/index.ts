/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from 'hono/jsx'
import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx'
import type { Env } from './types/bindings'
import { RootLayout } from './layouts/RootLayout'
import { Loading } from './components/Loading'

const app = new Hono<{ Bindings: Env }>()

// Configure JSX renderer
app.use('*', jsxRenderer({
  docType: true
}))

// Health check endpoint
app.get('/health', (c) => c.text('OK'))

// Root endpoint
app.get('/', (c) => {
  return c.render(
    <div class='prose lg:prose-xl mx-auto'>
      <h1>AI-Powered Blog</h1>
      <div class='py-4'>
        <Loading />
        <div>Content loading...</div>
      </div>
    </div>
  )
})

export default app
