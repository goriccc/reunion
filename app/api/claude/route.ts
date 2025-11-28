import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'claude-3-5-sonnet-20241022' } = await req.json();

    // 모델별 max_tokens 설정
    let maxTokens = 8192;
    if (model === 'claude-3-haiku-20240307') {
      maxTokens = 4096;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'  // ✅ 필수!
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        temperature: 1.0,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic API 에러:', error);
      
      // 모델을 찾을 수 없는 경우 더 명확한 메시지 제공
      if (error.type === 'not_found_error' && error.message?.includes('model')) {
        return NextResponse.json(
          { 
            type: 'model_not_found',
            message: `모델을 찾을 수 없습니다: ${model}. 사용 가능한 모델 이름을 확인해주세요.`,
            originalError: error
          }, 
          { status: response.status }
        );
      }
      
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('서버 에러:', error);
    const errorMessage = error?.message || error?.toString() || '서버 에러 발생';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
