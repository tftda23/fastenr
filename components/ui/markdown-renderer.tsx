"use client"

interface MarkdownRendererProps {
  htmlContent: string
  className?: string
}

export default function MarkdownRenderer({ htmlContent, className = "" }: MarkdownRendererProps) {

  return (
    <div 
      className={`prose prose-lg prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        // Custom styles for the markdown content
        '--tw-prose-headings': 'rgb(17 24 39)', // gray-900
        '--tw-prose-lead': 'rgb(75 85 99)', // gray-600
        '--tw-prose-links': 'rgb(37 99 235)', // blue-600
        '--tw-prose-bold': 'rgb(17 24 39)', // gray-900
        '--tw-prose-counters': 'rgb(107 114 128)', // gray-500
        '--tw-prose-bullets': 'rgb(209 213 219)', // gray-300
        '--tw-prose-hr': 'rgb(229 231 235)', // gray-200
        '--tw-prose-quotes': 'rgb(17 24 39)', // gray-900
        '--tw-prose-quote-borders': 'rgb(229 231 235)', // gray-200
        '--tw-prose-captions': 'rgb(107 114 128)', // gray-500
        '--tw-prose-code': 'rgb(17 24 39)', // gray-900
        '--tw-prose-pre-code': 'rgb(229 231 235)', // gray-200
        '--tw-prose-pre-bg': 'rgb(243 244 246)', // gray-100
        '--tw-prose-th-borders': 'rgb(209 213 219)', // gray-300
        '--tw-prose-td-borders': 'rgb(229 231 235)', // gray-200
      } as React.CSSProperties}
    />
  )
}