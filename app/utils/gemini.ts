export interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

export interface GeminiResponse {
  text: string
  isTruncated?: boolean
  finishReason?: string
  usage?: {
    promptTokens: number
    candidatesTokens: number
    totalTokens: number
  }
}

export async function callGeminiAPI(messages: Array<{ role: 'user' | 'assistant'; content: string }>, model?: string): Promise<GeminiResponse> {
  try {
    console.log('=== callGeminiAPI 시작 ===')
    console.log('모델:', model)
    console.log('메시지 개수:', messages.length)
    
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model }),
    })

    console.log('API 응답 상태:', response.status, response.statusText)
    console.log('API 응답 OK:', response.ok)

    if (!response.ok) {
      let errorMessage = 'Failed to call Gemini API'
      let errorDetails: any = null
      try {
        const error = await response.json()
        if (response.status === 429) {
          errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
          if (error.message) {
            errorMessage += ` (${error.message})`
          }
        } else if (typeof error === 'object') {
          if (error.message) {
            errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message)
          } else if (error.error) {
            errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error)
          } else {
            errorMessage = JSON.stringify(error)
          }
        } else {
          errorMessage = String(error)
        }
        errorDetails = error
        console.error('Gemini API error response:', error)
      } catch (e) {
        const errorText = await response.text()
        console.error('Gemini API error (text):', errorText)
        if (response.status === 429) {
          errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        } else {
          errorMessage = errorText || errorMessage
        }
        errorDetails = errorText
      }
      
      if (response.status === 429) {
        console.error('=== 429 Too Many Requests 에러 ===')
        console.error('API 요청 한도 초과')
        console.error('에러 상세:', errorDetails)
        console.error('사용된 모델:', model)
        console.error('========================')
      }
      
      throw new Error(errorMessage)
    }

    console.log('API 응답 파싱 시작')
    const data = await response.json()
    console.log('API 응답 파싱 완료')
    console.log('=== callGeminiAPI 완료 ===')
    
    return data
  } catch (error) {
    console.error('=== callGeminiAPI 에러 ===')
    console.error('에러 타입:', typeof error)
    console.error('에러 객체:', error)
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error))
    console.error('에러 스택:', error instanceof Error ? error.stack : '스택 정보 없음')
    console.error('=======================')
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to call Gemini API: ' + String(error))
  }
}

