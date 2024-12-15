# Vectorize Blog Development Tasks

## Core Infrastructure
- [x] Set up shadcn/ui components
  - [x] Install shadcn CLI and dependencies
  - [x] Add skeleton component for loading states
- [x] Configure Tailwind Typography
  - [x] Install @tailwindcss/typography
  - [x] Add typography plugin to tailwind.config.js

## Content Generation Pipeline
- [x] Implement blog post title generation
  - [x] Create Cloudflare Worker for title generation using llama model
  - [x] Set up workflow trigger from robots.txt access
- [x] Implement vector embedding generation
  - [x] Use bge-small-en-v1.5 model for embeddings
  - [x] Store embeddings in Vectorize index
- [x] Implement blog post content generation
  - [x] Create content generation worker using llama model
  - [x] Store content with metadata in Vectorize

## Frontend Implementation
- [x] Create blog post grid view
  - [x] Implement grid layout with Tailwind CSS
  - [x] Add skeleton loading states
- [x] Create blog post detail view
  - [x] Implement URL routing with title case and underscores
  - [x] Add Suspense boundaries for content loading
- [x] Add related posts section
  - [x] Implement vector similarity search
  - [x] Show 6 related articles with loading states

## SEO Implementation
- [x] Configure robots.txt
  - [x] Allow full crawling
  - [x] Link to sitemap.xml
- [x] Implement dynamic sitemap.xml
  - [x] Generate sitemap from blog posts
  - [x] Add HTML header link
  - [x] Update on content changes

## Testing
- [x] Add tests for vector utilities
  - [x] Test embedding generation
  - [x] Test content storage and retrieval
  - [x] Test related posts search
- [x] Add tests for content generation
  - [x] Test title generation workflow
  - [x] Test blog post generation
- [x] Add tests for frontend components
  - [x] Test loading states
  - [x] Test error boundaries
