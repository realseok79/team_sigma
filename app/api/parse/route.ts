import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EngineResponse } from '@/types';
import { parseCache, generateCacheKey, DEFAULT_TTL_MS } from '@/lib/cacheManager';

// [Stateless 참고] genAI는 설정(Configuration) 객체로,
// 요청 간 사용자 상태를 보관하지 않습니다. Stateless 원칙 준수.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 시스템 프롬프트 버전: 프롬프트 내용이 변경될 때마다 버전을 올려주세요.
// 이를 통해 캐시 키가 변경되어 이전 결과가 반환되지 않습니다.
const PROMPT_VERSION = "v1.0.0";

const SYSTEM_PROMPT = `
당신은 'Team-Sigma'의 지능형 엔진입니다. 사용자의 입력을 분석하여 작업(Task) 생성 또는 시스템 제어 명령을 JSON으로 반환하세요.

[핵심 규칙]
1. 사용자의 입력을 다음 두 가지 액션 중 하나로 분류하세요:
   - CREATE_TASK: 새로운 할 일이나 일정을 추가하려는 경우.
   - CHANGE_THEME: 테마(다크/라이트 모드)를 변경하려는 경우 (예: "어둡게 해줘", "눈부셔", "라이트 모드").

2. CREATE_TASK인 경우, 두 가지 모드 중 하나로 세부 분류하세요:
   - TO-DO (과업 중심): 구체적인 시각보다 수행 자체가 중요한 작업.
   - PLAN (시간 중심): 특정 시간에 수행되어야 하는 일정 (예: "~시부터", "~시에 미팅").

3. 추출 필드 규격:
   - action: "CREATE_TASK"
   - payload: {
       "title": "작업 제목",
       "entryType": "TODO" 또는 "PLAN",
       "category": "분류(회의, 개발, 디자인, 문서, 교육, 건강, 쇼핑, 개인, 일반 중 하나)",
       "priority": "high", "medium", "low" 중 하나,
       "difficulty": 1~5점 (TODO인 경우 제안),
       "estimatedTime": 예상 소요 시간(분 단위, TODO인 경우 제안),
       "startTime": "HH:mm" (PLAN인 경우 추출),
       "endTime": "HH:mm" (PLAN인 경우 추출),
       "isImportant": 중요 키워드 포함 시 true
     }

4. CHANGE_THEME인 경우:
   - action: "CHANGE_THEME"
   - payload: { "theme": "dark" 또는 "light" }

[주의사항]
- 결과는 반드시 순수한 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
- 시간 형식이 모호한 경우 최대한 현재 시각을 기준으로 추론하세요.
`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 });
    }

    // [캐싱] 1단계: 캐시 조회 (Fail-safe: 캐시 실패 시 무시하고 진행)
    const cacheKey = generateCacheKey(prompt, PROMPT_VERSION, {
      model: 'gemini-3.1-flash-lite',
      historyLength: history?.length || 0,
    });

    const cached = parseCache.get(cacheKey);
    if (cached) {
      const stats = parseCache.getStats();
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Stats': `hits=${stats.hits},misses=${stats.misses},rate=${stats.hitRate}`,
        },
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite',
      generationConfig: { responseMimeType: 'application/json' }
    });

    // [학습 알고리즘] 사용자 수정 이력이 있다면 프롬프트에 주입
    let userContext = "";
    if (history && Array.isArray(history) && history.length > 0) {
      userContext = `
[사용자 개인화 학습 데이터]
다음은 사용자가 과거에 AI가 제안한 난이도를 직접 수정한 내역입니다. 
이 패턴을 분석하여 사용자가 어떤 작업을 어렵게 느끼는지 파악하고, 이번 제안에 반영하세요.
${history.map((h: any) => `- 작업: "${h.taskTitle}" (카테고리: ${h.category}) -> AI제안: ${h.aiSuggestedDifficulty}, 사용자수정: ${h.userAdjustedDifficulty}`).join('\n')}
`;
    }

    const result = await model.generateContent([
      SYSTEM_PROMPT + (userContext ? `\n\n${userContext}` : ""), 
      `사용자 입력: "${prompt}"`
    ]);
    const responseText = result.response.text();
    
    const parsedResponse: EngineResponse = JSON.parse(responseText);

    // [캐싱] 2단계: 결과 저장 (Fail-safe: 저장 실패 시 무시)
    parseCache.set(cacheKey, parsedResponse, DEFAULT_TTL_MS);

    const stats = parseCache.getStats();
    return NextResponse.json(parsedResponse, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Stats': `hits=${stats.hits},misses=${stats.misses},rate=${stats.hitRate}`,
      },
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request with AI' },
      { status: 500 }
    );
  }
}
