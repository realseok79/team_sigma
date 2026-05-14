import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { splitCache, generateCacheKey, DEFAULT_TTL_MS } from '@/lib/cacheManager';

// [Stateless 참고] genAI는 설정 객체로, 요청 간 사용자 상태를 보관하지 않습니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 시스템 프롬프트 버전: 내용 변경 시 버전을 올려주세요.
const PROMPT_VERSION = "v1.0.0";

const SYSTEM_PROMPT = `
당신은 작업 분할 전문가입니다. 사용자가 오랫동안 미루고 있는 '악성 태스크'를 실행 가능한 2~4개의 작은 하위 태스크로 분해하세요.

[핵심 규칙]
1. 각 하위 태스크는 30분 이내에 완료 가능한 구체적인 단위여야 합니다.
2. 구체적인 행동 동사로 시작하세요 (예: "작성하다", "조사하다", "검토하다").
3. 원본 태스크의 카테고리를 유지하세요.
4. **범위 준수**: 모든 하위 태스크의 작업 합이 원본 태스크의 범위를 벗어나지 않도록 하세요.

[결과 형식]
JSON 형식으로 반환하세요:
{
  "subtasks": [
    { "title": "하위 작업 제목", "estimatedTime": 분단위 예상시간, "difficulty": 1~5 난이도 },
    ...
  ]
}
`;

export async function POST(req: NextRequest) {
  try {
    const { taskTitle, taskCategory, difficulty } = await req.json();

    if (!taskTitle) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    // [캐싱] 1단계: 캐시 조회 (Fail-safe)
    const cacheKey = generateCacheKey(taskTitle, PROMPT_VERSION, {
      model: 'gemini-2.5-flash',
      taskCategory,
      difficulty,
    });

    const cached = splitCache.get(cacheKey);
    if (cached) {
      const stats = splitCache.getStats();
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Stats': `hits=${stats.hits},misses=${stats.misses},rate=${stats.hitRate}`,
        },
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `원본 태스크: "${taskTitle}" (카테고리: ${taskCategory}, 난이도: ${difficulty}/5)`;

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      prompt
    ]);
    
    const responseText = result.response.text();
    const parsedResponse = JSON.parse(responseText);

    // [캐싱] 2단계: 결과 저장 (Fail-safe)
    splitCache.set(cacheKey, parsedResponse, DEFAULT_TTL_MS);

    const stats = splitCache.getStats();
    return NextResponse.json(parsedResponse, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Stats': `hits=${stats.hits},misses=${stats.misses},rate=${stats.hitRate}`,
      },
    });

  } catch (error) {
    console.error('Split Task Error:', error);
    return NextResponse.json({ error: 'Failed to split task' }, { status: 500 });
  }
}
