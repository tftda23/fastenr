import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export interface Doc {
  slug: string
  title: string
  description: string
  category: string
  difficulty: string
  readTime: string
  lastUpdated: string
  content: string
  excerpt: string
  tags: string[]
}

const docsDirectory = path.join(process.cwd(), 'content/docs')

export function getAllDocs(): Doc[] {
  if (!fs.existsSync(docsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(docsDirectory)
  const docs = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(docsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      // Extract metadata from frontmatter
      const title = data.title || 'Untitled Document'
      const description = data.description || ''
      const category = data.category || 'General'
      const difficulty = data.difficulty || 'Beginner'
      const readTime = data.readTime || calculateReadTime(content)
      const lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0]
      const tags = data.tags || []

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
        description,
        category,
        difficulty,
        readTime,
        lastUpdated,
        content,
        excerpt,
        tags
      }
    })

  // Sort by category, then by title
  return docs.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.title.localeCompare(b.title)
  })
}

export function getDocBySlug(slug: string): Doc | null {
  const docs = getAllDocs()
  return docs.find(doc => doc.slug === slug) || null
}

export function getDocsByCategory(category: string): Doc[] {
  const docs = getAllDocs()
  return docs.filter(doc => doc.category.toLowerCase() === category.toLowerCase())
}

export function getDocsByTag(tag: string): Doc[] {
  const docs = getAllDocs()
  return docs.filter(doc => doc.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
}

export function getDocsByDifficulty(difficulty: string): Doc[] {
  const docs = getAllDocs()
  return docs.filter(doc => doc.difficulty.toLowerCase() === difficulty.toLowerCase())
}

export function getAllCategories(): string[] {
  const docs = getAllDocs()
  const categories = docs.map(doc => doc.category)
  return Array.from(new Set(categories)).sort()
}

export function getAllTags(): string[] {
  const docs = getAllDocs()
  const tags = docs.flatMap(doc => doc.tags)
  return Array.from(new Set(tags)).sort()
}

export function renderDocMarkdown(content: string): string {
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