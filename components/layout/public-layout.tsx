"use client"

import type React from "react"
import { useEffect } from "react"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Force light mode for public pages
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    document.documentElement.setAttribute('data-theme', 'light')
    
    // Override any system theme detection
    const html = document.documentElement
    const observer = new MutationObserver(() => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark')
        html.classList.add('light')
        html.setAttribute('data-theme', 'light')
      }
    })
    
    observer.observe(html, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    })
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="light" data-theme="light" style={{ colorScheme: 'light' }}>
      {children}
    </div>
  )
}