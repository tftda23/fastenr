import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/service'

export async function GET() {
  try {
    const config = aiService.getConfiguration()
    
    return NextResponse.json({
      status: 'ok',
      ai: {
        configured: config.hasApiKey,
        model: config.hasApiKey ? config.model : 'not configured',
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        fallbackEnabled: process.env.AI_FALLBACK_TO_MOCK !== 'false'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Health Check Error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      ai: {
        configured: false,
        fallbackEnabled: process.env.AI_FALLBACK_TO_MOCK !== 'false'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}