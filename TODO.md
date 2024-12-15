# Vectorize Blog Development Tasks

## Core Infrastructure
- [ ] Set up shadcn/ui components
  - [ ] Install shadcn CLI and dependencies
  - [ ] Add skeleton component for loading states
- [ ] Configure Tailwind Typography
  - [ ] Install @tailwindcss/typography
  - [ ] Add typography plugin to tailwind.config.js

## Content Generation Pipeline
- [ ] Implement blog post title generation
  - [ ] Create Cloudflare Worker for title generation using llama model
  - [ ] Set up workflow trigger from robots.txt access
- [ ] Implement vector embedding generation
  - [ ] Use bge-small-en-v1.5 model for embeddings
  - [ ] Store embeddings in Vectorize index
- [ ] Implement blog post content generation
  - [ ] Create content generation worker using llama model
  - [ ] Store content with metadata in Vectorize

## Frontend Implementation
- [ ] Create blog post grid view
  - [ ] Implement grid layout with Tailwind CSS
  - [ ] Add skeleton loading states
- [ ] Create blog post detail view
  - [ ] Implement URL routing with title case and underscores
  - [ ] Add Suspense boundaries for content loading
- [ ] Add related posts section
  - [ ] Implement vector similarity search
  - [ ] Show 6 related articles with loading states

## SEO Implementation
- [ ] Configure robots.txt
  - [ ] Allow full crawling
  - [ ] Link to sitemap.xml
- [ ] Implement dynamic sitemap.xml
  - [ ] Generate sitemap from blog posts
  - [ ] Add HTML header link
  - [ ] Update on content changes

## Testing
- [ ] Add tests for vector utilities
  - [ ] Test embedding generation
  - [ ] Test content storage and retrieval
  - [ ] Test related posts search
- [ ] Add tests for content generation
  - [ ] Test title generation workflow
  - [ ] Test blog post generation
- [ ] Add tests for frontend components
  - [ ] Test loading states
  - [ ] Test error boundaries
