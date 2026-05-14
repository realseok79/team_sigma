import { EngineResponse } from '@/types';
import { getDifficultyHistory } from './userHistory';

/**
 * 지능형 파싱 엔진 API 호출 유틸리티
 * @param prompt 사용자가 입력한 자연어 텍스트
 * @returns 분석된 JSON 결과 (EngineResponse)
 */
export async function parseWithAI(prompt: string): Promise<EngineResponse> {
  try {
    const history = getDifficultyHistory();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, history }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // 타임아웃은 사용자 경험을 위한 의도된 동작이므로 에러 로그를 남기지 않습니다.
      throw error;
    }
    console.error('parseWithAI Error:', error);
    throw error;
  }
}
