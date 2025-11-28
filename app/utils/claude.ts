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

export async function callClaudeAPI(messages: ClaudeMessage[], model?: string): Promise<ClaudeResponse> {
  try {
    console.log('=== callClaudeAPI 시작 ===')
    console.log('모델:', model)
    console.log('메시지 개수:', messages.length)
    
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model }),
    })

    console.log('API 응답 상태:', response.status, response.statusText)
    console.log('API 응답 OK:', response.ok)

    if (!response.ok) {
      let errorMessage = 'Failed to call Claude API'
      let errorDetails: any = null
      try {
        const error = await response.json()
        // 429 Too Many Requests 에러 특별 처리
        if (response.status === 429) {
          errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
          if (error.message) {
            errorMessage += ` (${error.message})`
          }
        }
        // 모델을 찾을 수 없는 경우 특별 처리
        else if (error.type === 'model_not_found' || (error.type === 'not_found_error' && error.message?.includes('model'))) {
          errorMessage = error.message || `모델을 찾을 수 없습니다: ${model}`
        } else if (typeof error === 'object') {
          if (error.message) {
            errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message)
          } else if (error.error) {
            errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error)
          } else if (error.details) {
            errorMessage = typeof error.details === 'string' ? error.details : JSON.stringify(error.details)
          } else {
            errorMessage = JSON.stringify(error)
          }
        } else {
          errorMessage = String(error)
        }
        errorDetails = error
        console.error('Claude API error response:', error)
      } catch (e) {
        const errorText = await response.text()
        console.error('Claude API error (text):', errorText)
        if (response.status === 429) {
          errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        } else {
          errorMessage = errorText || errorMessage
        }
        errorDetails = errorText
      }
      
      // 404 에러인 경우 추가 정보 출력
      if (response.status === 404) {
        console.error('=== 404 에러 상세 정보 ===')
        console.error('요청 URL:', '/api/claude')
        console.error('응답 상태:', response.status, response.statusText)
        console.error('응답 헤더:', Object.fromEntries(response.headers.entries()))
        console.error('에러 상세:', errorDetails)
        console.error('사용된 모델:', model)
        console.error('========================')
      }
      
      // 429 에러인 경우 추가 정보 출력
      if (response.status === 429) {
        console.error('=== 429 Too Many Requests 에러 ===')
        console.error('API 요청 한도 초과')
        console.error('응답 헤더:', Object.fromEntries(response.headers.entries()))
        console.error('에러 상세:', errorDetails)
        console.error('사용된 모델:', model)
        console.error('========================')
      }
      
      throw new Error(errorMessage)
    }

    console.log('API 응답 파싱 시작')
    const data = await response.json()
    console.log('API 응답 파싱 완료')
    console.log('응답 데이터 타입:', typeof data)
    console.log('응답 데이터 키:', Object.keys(data || {}))
    console.log('=== callClaudeAPI 완료 ===')
    
    return data
  } catch (error) {
    console.error('=== callClaudeAPI 에러 ===')
    console.error('에러 타입:', typeof error)
    console.error('에러 객체:', error)
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error))
    console.error('에러 스택:', error instanceof Error ? error.stack : '스택 정보 없음')
    console.error('=======================')
    
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

