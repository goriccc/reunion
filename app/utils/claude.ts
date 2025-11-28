export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeResponse {
  content: Array<{
    type: string
    text: string
  }>
  id: string
  model: string
  role: string
  stop_reason: string
  stop_sequence: string | null
  type: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export async function callClaudeAPI(messages: ClaudeMessage[]): Promise<ClaudeResponse> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to call Claude API'
      try {
        const error = await response.json()
        errorMessage = error.error || error.details || errorMessage
        console.error('Claude API error response:', error)
      } catch (e) {
        const errorText = await response.text()
        console.error('Claude API error (text):', errorText)
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    console.error('Error in callClaudeAPI:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to call Claude API: ' + String(error))
  }
}

export interface PromptConfig {
  systemPrompt: string
  worldview: string
  personalityPrompt: string
  menuSubtitleDev?: string
  menuSubtitle?: string
  subtitleCharCount?: string
}

export async function getPrompts(productId?: number): Promise<PromptConfig> {
  if (typeof window === 'undefined') {
    return {
      systemPrompt: '',
      worldview: '',
      personalityPrompt: '',
    }
  }

  if (productId) {
    try {
      const response = await fetch(`/api/prompts?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        return {
          systemPrompt: data.systemPrompt || '',
          worldview: data.worldview || '',
          personalityPrompt: data.personalityPrompt || '',
          menuSubtitleDev: data.menuSubtitleDev || '',
          menuSubtitle: data.menuSubtitle || '',
          subtitleCharCount: data.subtitleCharCount !== null && data.subtitleCharCount !== undefined ? data.subtitleCharCount : '1000',
        }
      }
    } catch (error) {
      console.error('Error fetching prompts from Supabase:', error)
    }
    
    // Supabase에서 불러오기 실패 시 localStorage에서 시도 (하위 호환성)
    const productKey = `product_${productId}`
    return {
      systemPrompt: localStorage.getItem(`${productKey}_system_prompt`) || '',
      worldview: localStorage.getItem(`${productKey}_worldview`) || '',
      personalityPrompt: localStorage.getItem(`${productKey}_personality_prompt`) || '',
    }
  }

  // 기본값 (하위 호환성)
  return {
    systemPrompt: localStorage.getItem('claude_system_prompt') || '',
    worldview: localStorage.getItem('claude_worldview') || '',
    personalityPrompt: localStorage.getItem('claude_personality_prompt') || '',
  }
}

export function buildSystemMessage(prompts: PromptConfig): string {
  const parts: string[] = []
  
  if (prompts.systemPrompt) {
    parts.push(`[시스템 프롬프트]\n${prompts.systemPrompt}`)
  }
  
  if (prompts.worldview) {
    parts.push(`[세계관]\n${prompts.worldview}`)
  }
  
  if (prompts.personalityPrompt) {
    parts.push(`[성격 프롬프트]\n${prompts.personalityPrompt}`)
  }
  
  return parts.join('\n\n')
}

