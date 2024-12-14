/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from 'hono/jsx'
import type { FC } from 'hono/jsx'

export const RootLayout: FC<{ children: any }> = ({ children }) => (
  <html lang='en'>
    <head>
      <meta charset='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <title>AI-Powered Blog</title>
      <script src='https://cdn.tailwindcss.com'></script>
      <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.10/dist/typography.min.css' />
    </head>
    <body>
      <div class='container mx-auto px-4'>{children}</div>
    </body>
  </html>
)
