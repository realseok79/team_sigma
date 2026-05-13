// ==============================
// Team-Sigma: Category Classification Engine
// 한국어 키워드 기반 자동 카테고리 분류 및 지능형 파싱 (TODO vs PLAN)
// ==============================

import { CategoryInfo, ParsedInput, EntryType } from '@/types';

// 카테고리 정의 (컬러 팔레트 포함)
const CATEGORIES: CategoryInfo[] = [
  { name: '프레젠테이션', bgColor: 'bg-orange-100', textColor: 'text-orange-600', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-400' },
  { name: '회의', bgColor: 'bg-blue-100', textColor: 'text-blue-600', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-400' },
  { name: '개발', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-400' },
  { name: '디자인', bgColor: 'bg-pink-100', textColor: 'text-pink-600', darkBg: 'dark:bg-pink-900/30', darkText: 'dark:text-pink-400' },
  { name: '문서', bgColor: 'bg-cyan-100', textColor: 'text-cyan-600', darkBg: 'dark:bg-cyan-900/30', darkText: 'dark:text-cyan-400' },
  { name: '교육', bgColor: 'bg-purple-100', textColor: 'text-purple-600', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-400' },
  { name: '외부 협력', bgColor: 'bg-amber-100', textColor: 'text-amber-600', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-400' },
  { name: '건강', bgColor: 'bg-lime-100', textColor: 'text-lime-600', darkBg: 'dark:bg-lime-900/30', darkText: 'dark:text-lime-400' },
  { name: '쇼핑', bgColor: 'bg-rose-100', textColor: 'text-rose-600', darkBg: 'dark:bg-rose-900/30', darkText: 'dark:text-rose-400' },
  { name: '개인', bgColor: 'bg-violet-100', textColor: 'text-violet-600', darkBg: 'dark:bg-violet-900/30', darkText: 'dark:text-violet-400' },
  { name: '일반', bgColor: 'bg-slate-100', textColor: 'text-slate-600', darkBg: 'dark:bg-slate-900/30', darkText: 'dark:text-slate-400' },
];

// 키워드 → 카테고리 매핑
const KEYWORD_MAP: Record<string, string> = {
  '발표': '프레젠테이션', 'PT': '프레젠테이션', 'ppt': '프레젠테이션', '슬라이드': '프레젠테이션',
  '미팅': '회의', '회의': '회의', '싱크업': '회의', '스탠드업': '회의', '브리핑': '회의',
  '코딩': '개발', '개발': '개발', '프로그래밍': '개발', '버그': '개발', '배포': '개발',
  '디자인': '디자인', 'UI': '디자인', 'UX': '디자인', '목업': '디자인', '피그마': '디자인',
  '보고서': '문서', '문서': '문서', '제안서': '문서', '기획서': '문서',
  '공부': '교육', '학습': '교육', '강의': '교육', '수업': '교육', '과제': '교육',
  '클라이언트': '외부 협력', '고객': '외부 협력', '파트너': '외부 협력', '협업': '외부 협력',
  '운동': '건강', '헬스': '건강', '병원': '건강', '약': '건강', '산책': '건강',
  '쇼핑': '쇼핑', '구매': '쇼핑', '주문': '쇼핑', '장보기': '쇼핑',
  '집': '개인', '청소': '개인', '빨래': '개인', '요리': '개인',
};

const IMPORTANT_KEYWORDS = ['중요', '급함', '긴급', '별표', 'ASAP', '우선', '급한', '시급', '필수', '꼭'];

const DUE_PATTERNS = [
  { pattern: /오늘까지|오늘\s*마감/, label: '오늘까지' },
  { pattern: /내일까지|내일\s*마감/, label: '내일까지' },
  { pattern: /이번\s*주까지|금주까지/, label: '이번 주까지' },
];

// PLAN 시간 패턴 정규식
const TIME_RANGE_PATTERN = /(\d{1,2})시(?:\s*(\d{1,2})분)?\s*(?:부터|~)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/;
const TIME_SINGLE_PATTERN = /(\d{1,2})시(?:\s*(\d{1,2})분)?/;
const DIGITAL_TIME_PATTERN = /(\d{1,2}):(\d{2})/;

function formatTime(h: string, m: string = '00'): string {
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

/**
 * 카테고리 이름으로 CategoryInfo를 조회합니다.
 */
function getCategoryByName(name: string): CategoryInfo {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
}

/**
 * CategoryInfo를 Tailwind 클래스 문자열로 변환합니다.
 */
export function categoryToColorClass(cat: CategoryInfo): string {
  return `${cat.bgColor} ${cat.textColor} ${cat.darkBg} ${cat.darkText}`;
}

/**
 * 사용자 입력 텍스트를 분석하여 TO-DO/PLAN 분류 및 속성을 추출합니다.
 */
export function parseTaskInput(input: string): ParsedInput {
  const trimmed = input.trim();
  let cleanedTitle = trimmed;
  let entryType: EntryType = 'TODO';
  let startTime: string | undefined;
  let endTime: string | undefined;

  // 1. 중요도 감지
  let isImportant = false;
  for (const keyword of IMPORTANT_KEYWORDS) {
    const regex = new RegExp(`${keyword}[!！]*\\s*`, 'gi');
    if (regex.test(cleanedTitle)) {
      isImportant = true;
      cleanedTitle = cleanedTitle.replace(regex, '').trim();
    }
  }

  // 2. PLAN 모드 시간 추출 (시작/종료 범위 우선)
  const rangeMatch = cleanedTitle.match(TIME_RANGE_PATTERN);
  if (rangeMatch) {
    entryType = 'PLAN';
    startTime = formatTime(rangeMatch[1], rangeMatch[2]);
    endTime = formatTime(rangeMatch[3], rangeMatch[4]);
    cleanedTitle = cleanedTitle.replace(TIME_RANGE_PATTERN, '').trim();
  } else {
    // 단일 시간 패턴
    const singleMatch = cleanedTitle.match(TIME_SINGLE_PATTERN) || cleanedTitle.match(DIGITAL_TIME_PATTERN);
    if (singleMatch) {
      entryType = 'PLAN';
      startTime = formatTime(singleMatch[1], singleMatch[2]);
      cleanedTitle = cleanedTitle.replace(singleMatch[0], '').trim();
    }
  }

  // 3. TO-DO 파라미터 추출 (PLAN이 아닌 경우에만 집중)
  let difficulty: number | undefined;
  let estimatedTime: number | undefined;
  let priority: ParsedInput['priority'] = 'medium';

  if (entryType === 'TODO') {
    // 예상 시간 추출 (예: 30분, 1시간, 2.5시간)
    const hourMatch = cleanedTitle.match(/(\d+(?:\.\d+)?)\s*시간/);
    const minMatch = cleanedTitle.match(/(\d+)\s*분/);
    
    let totalMins = 0;
    if (hourMatch) totalMins += parseFloat(hourMatch[1]) * 60;
    if (minMatch) totalMins += parseInt(minMatch[1]);
    
    if (totalMins > 0) {
      estimatedTime = totalMins;
      cleanedTitle = cleanedTitle.replace(/(\d+(?:\.\d+)?)\s*시간/, '').replace(/(\d+)\s*분/, '').trim();
    }

    // 난이도 분석
    if (/매우\s*어려운|극악/.test(cleanedTitle)) difficulty = 5;
    else if (/어려운|복잡한|힘든/.test(cleanedTitle)) difficulty = 4;
    else if (/보통|일반적인/.test(cleanedTitle)) difficulty = 3;
    else if (/쉬운|단순한|금방/.test(cleanedTitle)) difficulty = 2;
    else if (/매우\s*쉬운|간단한/.test(cleanedTitle)) difficulty = 1;
    
    if (difficulty) {
      cleanedTitle = cleanedTitle.replace(/매우\s*어려운|극악|어려운|복잡한|힘든|보통|일반적인|쉬운|단순한|금방|매우\s*쉬운|간단한/g, '').trim();
    } else {
      difficulty = 3; // 기본값
    }

    // 우선순위 매핑
    if (isImportant) priority = 'high';
    else if (/낮은|천천히|나중에/.test(cleanedTitle)) priority = 'low';
  }

  // 4. 마감일 감지
  let dueDate: string | undefined;
  for (const { pattern, label } of DUE_PATTERNS) {
    if (pattern.test(cleanedTitle)) {
      dueDate = label;
      cleanedTitle = cleanedTitle.replace(pattern, '').trim();
      break;
    }
  }

  // 5. 카테고리 감지
  let detectedCategory = '일반';
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (trimmed.toLowerCase().includes(keyword.toLowerCase())) {
      detectedCategory = category;
      break;
    }
  }

  const category = getCategoryByName(detectedCategory);

  if (!cleanedTitle) cleanedTitle = trimmed;

  return {
    title: cleanedTitle,
    category,
    isImportant,
    dueDate,
    entryType,
    startTime,
    endTime,
    difficulty,
    estimatedTime,
    priority,
  };
}

export function getAllCategories(): CategoryInfo[] {
  return CATEGORIES;
}
