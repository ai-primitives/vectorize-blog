import { html } from 'hono/html'

export const Loading = () => html`
  <div class="flex items-center justify-center p-8">
    <div class="animate-pulse space-y-4">
      <div class="h-4 bg-gray-200 rounded w-48"></div>
      <div class="h-4 bg-gray-200 rounded w-36"></div>
    </div>
  </div>
`
