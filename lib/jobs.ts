import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export interface Job {
  slug: string
  title: string
  location: string
  type: string
  department: string
  content: string
  excerpt: string
}

const jobsDirectory = path.join(process.cwd(), 'content/jobs')

export function getAllJobs(): Job[] {
  const fileNames = fs.readdirSync(jobsDirectory)
  const jobs = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(jobsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      // Extract job details from the markdown content
      const lines = content.split('\n')
      const title = lines[0].replace('# ', '')
      
      // Find location, type, and department from the front matter-like content
      const locationMatch = content.match(/\*\*Location:\*\* (.+)/);
      const typeMatch = content.match(/\*\*Type:\*\* (.+)/);
      const departmentMatch = content.match(/\*\*Department:\*\* (.+)/);

      const location = locationMatch ? locationMatch[1] : 'Remote'
      const type = typeMatch ? typeMatch[1] : 'Full-time'
      const department = departmentMatch ? departmentMatch[1] : 'General'

      // Create excerpt from first paragraph
      const paragraphs = content.split('\n\n')
      const firstParagraph = paragraphs.find(p => p.length > 50 && !p.startsWith('#') && !p.startsWith('**'))
      const excerpt = firstParagraph ? firstParagraph.slice(0, 200) + '...' : ''

      return {
        slug,
        title,
        location,
        type,
        department,
        content,
        excerpt
      }
    })

  return jobs.sort((a, b) => a.title.localeCompare(b.title))
}

export function getJobBySlug(slug: string): Job | null {
  const jobs = getAllJobs()
  return jobs.find(job => job.slug === slug) || null
}

export function renderMarkdown(content: string): string {
  const result = marked(content, {
    breaks: true,
    gfm: true
  })
  // Handle both string and Promise<string> return types
  return typeof result === 'string' ? result : ''
}