import { EngineResponse } from '@/types';
import { getDifficultyHistory } from './userHistory';

/**
 * 지능형 파싱 엔진 API 호출 유틸리티 (Exponential Backoff 재시도 포함)
 * @param prompt 사용자가 입력한 자연어 텍스트
 * @param onRetry 재시도 발생 시 호출되는 콜백 (UI 피드백용)
 * @returns 분석된 JSON 결과 (EngineResponse)
 */
export async function parseWithAI(
  prompt: string, 
  onRetry?: (attempt: number, delay: number) => void
): Promise<EngineResponse> {
  const MAX_RETRIES = 3;
  const retryStatusCodes = [429, 503];

  async function attemptFetch(attempt: number): Promise<EngineResponse> {
    try {
      const history = getDifficultyHistory();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 재시도 시에는 10초로 약간 늘림

      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, history }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let responseData: any = null;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error('JSON Parsing Error:', jsonError);
        }
      }

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || 'Unknown API error';
        
        // 재시도 대상 에러인 경우
        if (retryStatusCodes.includes(response.status) && attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.warn(`AI API ${response.status} Error. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
          
          if (onRetry) onRetry(attempt + 1, delay);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptFetch(attempt + 1);
        }

        console.error(`AI API Request Failed (${response.status}):`, errorMessage);
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).data = responseData;
        throw error;
      }

      if (!responseData) {
        throw new Error('Empty or invalid response from AI API');
      }

      return responseData;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`AI API Timeout. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
          if (onRetry) onRetry(attempt + 1, delay);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptFetch(attempt + 1);
        }
        throw new Error('서버 응답이 너무 늦습니다. 잠시 후 다시 시도해 주세요.');
      }
      
      // 예상치 못한 네트워크 에러 등도 재시도 고려 가능하나, 
      // 여기서는 명시적인 상태 코드와 타임아웃만 재시도합니다.
      throw error;
    }
  }

  return attemptFetch(0);
}
