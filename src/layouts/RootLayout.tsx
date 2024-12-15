import { html } from 'hono/html'
import type { Child } from 'hono/jsx'
import type { BlogPostMeta } from '../types/blog'

type Props = {
  children: Child
  meta?: Partial<BlogPostMeta>
}

export const RootLayout = ({ children, meta = {} }: Props) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${meta.title || 'AI-Powered Blog'}</title>
      <meta name="description" content="${meta.description || 'An AI-powered blog with dynamic content generation'}" />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <link href="/styles/globals.css" rel="stylesheet" />
    </head>
    <body>
      <div class="container mx-auto px-4">
        ${meta.headline ? `
          <header class="py-8">
            <h1 class="text-4xl font-bold">${meta.headline}</h1>
            ${meta.subhead ? `<p class="text-xl mt-2">${meta.subhead}</p>` : ''}
            ${meta.tagline ? `<p class="text-lg mt-1 text-gray-600">${meta.tagline}</p>` : ''}
          </header>
        ` : ''}
        ${children}
      </div>
    </body>
  </html>
`
