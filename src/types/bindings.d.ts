import type { Environment } from 'hono'

interface Bindings {
  AI: {
    run<T = any>(model: string, options: { prompt: string; stream?: boolean }): Promise<T>
  }
  BLOG_INDEX: {
    query(vector: number[], options?: { topK?: number }): Promise<any>
    insert(vectors: { id: string; values: number[] }[]): Promise<void>
    upsert(vectors: { id: string; values: number[]; metadata?: Record<string, any> }[]): Promise<void>
  }
}

export type Env = Environment & Bindings
