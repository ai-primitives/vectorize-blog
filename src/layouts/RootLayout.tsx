import type { FC } from 'hono/jsx'
import type { Child } from 'hono/jsx'
import type { BlogPostMeta } from '../types/blog'

type Props = {
  children: Child
  meta?: Partial<BlogPostMeta>
}

export const RootLayout: FC<Props> = ({ children, meta = {} }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{meta.title || 'AI-Powered Blog'}</title>
      <meta name="description" content={meta.description || 'An AI-powered blog with dynamic content generation'} />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.10/dist/typography.min.css" />
    </head>
    <body>
      <div class="container mx-auto px-4">
        {meta.headline && (
          <header class="py-8">
            <h1 class="text-4xl font-bold">{meta.headline}</h1>
            {meta.subhead && <p class="text-xl mt-2">{meta.subhead}</p>}
            {meta.tagline && <p class="text-lg mt-1 text-gray-600">{meta.tagline}</p>}
          </header>
        )}
        {children}
      </div>
    </body>
  </html>
)
