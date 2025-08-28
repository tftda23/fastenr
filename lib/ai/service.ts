interface AIInsight {
  type: 'risk' | 'opportunity' | 'action' | 'trend'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  actionable?: boolean
  accountId?: string
  accountName?: string
  suggestedAction?: string
}

interface AIResponse {
  summary: string
  keyMetrics?: {
    totalAccounts?: number
    atRiskAccounts?: number
    opportunityAccounts?: number
    avgHealthScore?: number
    trendDirection?: 'up' | 'down' | 'stable'
  }
  insights: AIInsight[]
}

export class AIService {
  private apiKey: string | undefined
  private model: string
  private maxTokens: number
  private temperature: number

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
    this.model = process.env.OPENAI_MODEL || 'gpt-4'
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '2000')
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.3')
  }

  private validateConfiguration(): void {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
    }
  }

  async generateInsights(prompt: string): Promise<AIResponse> {
    this.validateConfiguration()

    try {
      console.log('AI Service: Calling OpenAI API with model:', this.model)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert Customer Success AI analyst. You analyze customer data and provide actionable insights in JSON format only. Always respond with valid JSON that matches the expected schema. Focus on practical, actionable recommendations that Customer Success Managers can implement immediately.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OpenAI API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })

        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.')
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.')
        } else if (response.status === 403) {
          throw new Error('OpenAI API access denied. Please check your API key permissions.')
        } else {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()
      console.log('AI Service: Received response from OpenAI')
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI API')
      }

      const content = data.choices[0].message.content
      console.log('AI Service: Parsing AI response content')
      
      let aiResponse: AIResponse
      try {
        aiResponse = JSON.parse(content)
      } catch (parseError) {
        console.error('AI Service: Failed to parse AI response as JSON:', content)
        throw new Error('AI returned invalid JSON response. Please try again.')
      }

      // Validate the response structure
      if (!aiResponse.summary || !Array.isArray(aiResponse.insights)) {
        console.error('AI Service: Invalid response structure:', aiResponse)
        throw new Error('AI response missing required fields (summary or insights)')
      }

      // Sanitize and validate insights
      aiResponse.insights = aiResponse.insights.filter(insight => 
        insight.title && 
        insight.description && 
        insight.priority && 
        insight.category &&
        ['risk', 'opportunity', 'action', 'trend'].includes(insight.type) &&
        ['high', 'medium', 'low'].includes(insight.priority)
      )

      console.log(`AI Service: Successfully generated ${aiResponse.insights.length} insights`)
      return aiResponse

    } catch (error) {
      console.error('AI Service Error:', error)
      
      // Re-throw known errors
      if (error instanceof Error && error.message.includes('OpenAI')) {
        throw error
      }
      
      // Handle network errors
      if (error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('ECONNREFUSED')
      )) {
        throw new Error('Unable to connect to AI service. Please check your internet connection and try again.')
      }
      
      // Generic error
      throw new Error('AI analysis failed. Please try again later.')
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  getConfiguration(): { model: string; maxTokens: number; temperature: number; hasApiKey: boolean } {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      hasApiKey: !!this.apiKey
    }
  }
}

// Singleton instance
export const aiService = new AIService()