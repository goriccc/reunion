import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasUrl = !!supabaseUrl
  const hasKey = !!supabaseAnonKey
  const urlLength = supabaseUrl?.length || 0
  const keyLength = supabaseAnonKey?.length || 0

  // 키의 일부만 표시 (보안)
  const maskedUrl = supabaseUrl 
    ? `${supabaseUrl.substring(0, 20)}...` 
    : 'Not set'
  const maskedKey = supabaseAnonKey 
    ? `${supabaseAnonKey.substring(0, 20)}...` 
    : 'Not set'

  return NextResponse.json({
    configured: hasUrl && hasKey,
    url: {
      exists: hasUrl,
      length: urlLength,
      preview: maskedUrl,
    },
    key: {
      exists: hasKey,
      length: keyLength,
      preview: maskedKey,
    },
    message: hasUrl && hasKey 
      ? 'Supabase 키가 올바르게 설정되었습니다.' 
      : 'Supabase 키가 설정되지 않았습니다. .env.local 파일을 확인하세요.',
  })
}



