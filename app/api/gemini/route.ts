import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Gemini API 라우트 시작 ===');
    const body = await req.json();
    const { messages, model = 'gemini-2.5-flash' } = body;
    
    console.log('요청 모델:', model);
    console.log('메시지 개수:', messages?.length);
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('메시지가 없거나 잘못된 형식');
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Gemini API 키가 설정되지 않음');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }
    
    console.log('API 키 확인 완료 (길이:', apiKey.length, ')');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 모델 선택
    const selectedModel = model || 'gemini-2.5-flash';
    
    // 모델별 최대 출력 토큰 설정
    // Gemini 2.5 Pro: 65536, Gemini 2.5 Flash: 8192
    const maxOutputTokens = selectedModel.includes('pro') ? 65536 : 8192;
    
    const geminiModel = genAI.getGenerativeModel({ 
      model: selectedModel,
      generationConfig: {
        maxOutputTokens: maxOutputTokens,
      }
    });

    // Gemini는 대화형 API를 지원하므로 전체 대화 히스토리를 전달
    // messages 배열을 Gemini 형식으로 변환
    const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
    let currentPrompt = ''
    
    messages.forEach((msg: { role: string; content: string }, index: number) => {
      if (msg.role === 'user') {
        if (index === messages.length - 1) {
          // 마지막 메시지는 prompt로 사용
          currentPrompt = msg.content
        } else {
          // 이전 user 메시지는 history에 추가
          history.push({ role: 'user', parts: [{ text: msg.content }] })
        }
      } else if (msg.role === 'assistant') {
        // assistant 메시지는 history에 추가
        history.push({ role: 'model', parts: [{ text: msg.content }] })
      }
    })

    console.log('Gemini API 호출 시작');
    console.log('히스토리 길이:', history.length);
    console.log('현재 프롬프트 길이:', currentPrompt.length);
    
    let result
    
    try {
      if (history.length > 0) {
        // 대화 히스토리가 있는 경우
        console.log('대화 히스토리 사용');
        const chat = geminiModel.startChat({ history })
        result = await chat.sendMessage(currentPrompt || messages[messages.length - 1].content)
      } else {
        // 첫 번째 호출인 경우
        console.log('첫 번째 호출 (히스토리 없음)');
        result = await geminiModel.generateContent(currentPrompt || messages[0].content)
      }
    } catch (apiError: any) {
      console.error('Gemini API 호출 에러:', apiError);
      console.error('에러 메시지:', apiError?.message);
      console.error('에러 스택:', apiError?.stack);
      throw new Error(`Gemini API 호출 실패: ${apiError?.message || String(apiError)}`);
    }
    
    const response = await result.response
    const text = response.text()
    
    // 응답 완료 이유 확인
    const finishReason = result.response.candidates?.[0]?.finishReason
    const isTruncated = finishReason === 'MAX_TOKENS' || finishReason === 'OTHER'

    console.log('Gemini API 응답 완료');
    console.log('응답 텍스트 길이:', text.length);
    console.log('Finish Reason:', finishReason);
    console.log('응답이 중간에 끊김:', isTruncated);

    // Gemini 응답을 Claude 형식과 유사하게 변환
    return NextResponse.json({
      text: text,
      isTruncated: isTruncated,
      finishReason: finishReason,
      usage: result.response.usageMetadata ? {
        promptTokens: result.response.usageMetadata.promptTokenCount || 0,
        candidatesTokens: result.response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: result.response.usageMetadata.totalTokenCount || 0,
      } : undefined,
    });

  } catch (error: any) {
    console.error('=== Gemini API 라우트 에러 ===');
    console.error('에러 타입:', typeof error);
    console.error('에러 객체:', error);
    console.error('에러 메시지:', error?.message);
    console.error('에러 스택:', error?.stack);
    console.error('에러 전체:', JSON.stringify(error, null, 2));
    console.error('============================');
    
    const errorMessage = error?.message || error?.toString() || '서버 에러 발생';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error?.stack || error?.toString()
      },
      { status: 500 }
    );
  }
}

