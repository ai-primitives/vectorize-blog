import type { Environment } from 'hono'

type AIModel = '@cf/meta/llama-2-7b-chat-int8' | '@cf/baai/bge-base-en-v1.5'

interface AiTextGenerationInput {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
}

interface AiEmbeddingInput {
  text: string[]
}

interface VectorizeMatch {
  id: string
  score: number
  metadata?: Record<string, any>
}

interface VectorizeQueryResult {
  matches: VectorizeMatch[]
}

interface AIResponse {
  response: string
}

interface AIEmbeddingResponse {
  data: number[][]
}

interface Bindings {
  AI: {
    run(model: AIModel, input: AiTextGenerationInput | AiEmbeddingInput): Promise<AIResponse | AIEmbeddingResponse>
  }
  BLOG_INDEX: {
    query(vector: number[], options?: { topK?: number }): Promise<VectorizeQueryResult>
    insert(vectors: { id: string; values: number[] }[]): Promise<void>
    upsert(vectors: { id: string; values: number[]; metadata?: Record<string, any> }[]): Promise<void>
  }
}

export type Env = Environment & Bindings
