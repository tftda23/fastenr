import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  content: string
  featured?: boolean
}

const blogDirectory = path.join(process.cwd(), 'content/blog')

export function getAllBlogPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(blogDirectory)
  const posts = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(blogDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      // Extract metadata from frontmatter
      const title = data.title || 'Untitled Post'
      const author = data.author || 'Fastenr Team'
      const date = data.date || new Date().toISOString().split('T')[0]
      const category = data.category || 'Customer Success'
      const tags = data.tags || []
      const readTime = data.readTime || calculateReadTime(content)
      const featured = data.featured || false

      // Create excerpt from content or use provided excerpt
      let excerpt = data.excerpt
      if (!excerpt) {
        // Find first paragraph that's not a heading
        const paragraphs = content.split('\n\n')
        const firstParagraph = paragraphs.find(p => 
          p.length > 100 && 
          !p.startsWith('#') && 
          !p.startsWith('**') &&
          !p.startsWith('!')
        )
        excerpt = firstParagraph ? firstParagraph.slice(0, 300) + '...' : ''
      }

      return {
        slug,
        title,
        excerpt,
        author,
        date,
        readTime,
        category,
        tags,
        content,
        featured
      }
    })

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts()
  return posts.find(post => post.slug === slug) || null
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  const posts = getAllBlogPosts()
  return posts.filter(post => post.category.toLowerCase() === category.toLowerCase())
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  const posts = getAllBlogPosts()
  return posts.filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
}

export function getFeaturedBlogPosts(): BlogPost[] {
  const posts = getAllBlogPosts()
  return posts.filter(post => post.featured)
}

export function getAllCategories(): string[] {
  const posts = getAllBlogPosts()
  const categories = posts.map(post => post.category)
  return Array.from(new Set(categories)).sort()
}

export function getAllTags(): string[] {
  const posts = getAllBlogPosts()
  const tags = posts.flatMap(post => post.tags)
  return Array.from(new Set(tags)).sort()
}

export function renderBlogMarkdown(content: string): string {
  const result = marked(content, {
    breaks: true,
    gfm: true
  })
  return typeof result === 'string' ? result : ''
}

// Helper function to calculate reading time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const readTime = Math.ceil(words / wordsPerMinute)
  return `${readTime} min read`
}