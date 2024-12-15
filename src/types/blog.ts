export interface BlogPostMeta {
  title: string
  description: string
  tagline: string
  headline: string
  subhead: string
  content: string
  url: string
  embeddings: {
    title: number[]
    description: number[]
    tagline: number[]
    headline: number[]
    subhead: number[]
    content: number[]
  }
}

export interface BlogPostInput {
  title: string
  description: string
  tagline: string
  headline: string
  subhead: string
  content: string
}

export const formatBlogUrl = (title: string): string => {
  return `/blog/${title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_')}`
}
