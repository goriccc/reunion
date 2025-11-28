import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("=========== [구글이 허용한 모델 리스트] ===========");
    
    const availableModels: string[] = [];
    
    if (data.models) {
      data.models.forEach((model: any) => {
        // 'generateContent' 기능을 지원하는 모델만 필터링
        if (model.supportedGenerationMethods?.includes("generateContent")) {
          const modelName = model.name.replace("models/", "");
          console.log(`✅ 모델명: ${modelName}`);
          availableModels.push(modelName);
        }
      });
    } else {
      console.error("❌ 모델 목록을 가져오지 못했습니다. 에러 메시지:", data);
    }
    
    console.log("===================================================");

    return NextResponse.json({
      success: true,
      models: availableModels,
      rawData: data
    });

  } catch (error: any) {
    console.error("통신 에러:", error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to fetch models',
        details: error?.toString()
      },
      { status: 500 }
    );
  }
}

