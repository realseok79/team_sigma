import { NextRequest, NextResponse } from 'next/server';

/**
 * 지능형 파싱 엔진 API 엔드포인트
 * 클라이언트로부터 텍스트 입력을 받아 LLM을 통해 분석된 결과를 반환합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // TODO: Step 4에서 Gemini AI 연동 로직 추가 예정
    
    // 임시 응답 (골격 확인용)
    return NextResponse.json({
      message: 'API Skeleton created',
      receivedPrompt: prompt
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
