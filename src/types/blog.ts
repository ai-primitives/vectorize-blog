export interface BlogPostMeta {
  title: string
  description: string
  tagline: string
  headline: string
  subhead: string
  content: string
  url: string
}

export interface BlogPostInput {
  title: string
  description: string
  tagline: string
  headline: string
  subhead: string
  content: string
  embedding: number[]
}

export interface GeneratedContent {
  title: string
  description: string
  tagline: string
  headline: string
  subhead: string
}

export const formatBlogUrl = (title: string): string => {
  return `/blog/${title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_')}`
}
