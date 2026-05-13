import { EngineResponse } from '@/types';

/**
 * 지능형 파싱 엔진 API 호출 유틸리티
 * @param prompt 사용자가 입력한 자연어 텍스트
 * @returns 분석된 JSON 결과 (EngineResponse)
 */
export async function parseWithAI(prompt: string): Promise<EngineResponse> {
  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('parseWithAI Error:', error);
    throw error;
  }
}
