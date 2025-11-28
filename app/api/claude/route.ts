import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192, // Claude Sonnet 4의 최대 토큰 제한
        messages: messages,
      }),
    })

    if (!response.ok) {
      let errorData: string
      try {
        const errorJson = await response.json()
        errorData = JSON.stringify(errorJson)
        console.error('Claude API error (JSON):', errorJson)
      } catch {
        errorData = await response.text()
        console.error('Claude API error (text):', errorData)
      }
      
      // 더 자세한 에러 정보 로깅
      console.error('Claude API response status:', response.status)
      console.error('Claude API response headers:', Object.fromEntries(response.headers.entries()))
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch from Claude API', 
          details: errorData,
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error calling Claude API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

