import type { Child } from 'hono/jsx'

declare global {
  namespace JSX {
    type Element = Child
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
