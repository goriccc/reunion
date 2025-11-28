import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      message: 'ANTHROPIC_API_KEY가 .env.local 파일에 설정되지 않았습니다.'
    })
  }
  
  // API 키가 설정되어 있는지만 확인 (실제 API 호출은 하지 않음)
  return NextResponse.json({
    configured: true,
    message: 'API 키가 설정되어 있습니다.',
    keyPrefix: apiKey.substring(0, 10) + '...' // 보안을 위해 일부만 표시
  })
}



