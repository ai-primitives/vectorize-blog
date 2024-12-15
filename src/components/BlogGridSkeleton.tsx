import { html } from 'hono/html'
import { Skeleton } from './ui/skeleton'

export const BlogGridSkeleton = () => html`
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${Array(6).fill(0).map(() => html`
        <div class="p-6 bg-white rounded-lg border">
          <Skeleton class="h-6 w-3/4 mb-2" />
          <Skeleton class="h-4 w-full mb-4" />
          <Skeleton class="h-4 w-2/3" />
        </div>
      `).join('')}
    </div>
  </div>
`
