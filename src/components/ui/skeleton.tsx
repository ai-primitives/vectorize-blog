import { html } from 'hono/html'
import { cn } from '../../lib/utils'

interface Props {
  className?: string
}

function Skeleton({ className }: Props) {
  return html`
    <div class="${cn('animate-pulse rounded-md bg-muted', className)}">
    </div>
  `
}

export { Skeleton }
