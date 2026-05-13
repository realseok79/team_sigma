// ==============================
// Flow To-Do: Category Classification Engine
// 한국어 키워드 기반 자동 카테고리 분류
// ==============================

import { CategoryInfo, ParsedInput } from '@/types';

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
  // 프레젠테이션
  '발표': '프레젠테이션', 'PT': '프레젠테이션', 'ppt': '프레젠테이션', '프레젠테이션': '프레젠테이션', '슬라이드': '프레젠테이션',
  // 회의
  '미팅': '회의', '회의': '회의', '싱크업': '회의', '스탠드업': '회의', '브리핑': '회의', '콜': '회의',
  // 개발
  '코딩': '개발', '개발': '개발', '프로그래밍': '개발', '버그': '개발', '디버그': '개발', '배포': '개발', '테스트': '개발', 'API': '개발', '코드': '개발', '깃': '개발', '커밋': '개발',
  // 디자인
  '디자인': '디자인', 'UI': '디자인', 'UX': '디자인', '목업': '디자인', '피그마': '디자인', '와이어프레임': '디자인', '로고': '디자인',
  // 문서
  '보고서': '문서', '문서': '문서', '제안서': '문서', '기획서': '문서', '레포트': '문서', '작성': '문서', '초안': '문서', '리뷰': '문서',
  // 교육
  '공부': '교육', '학습': '교육', '강의': '교육', '교육': '교육', '수업': '교육', '과제': '교육', '독서': '교육', '읽기': '교육',
  // 외부 협력
  '클라이언트': '외부 협력', '고객': '외부 협력', '파트너': '외부 협력', '외주': '외부 협력', '협업': '외부 협력', '거래처': '외부 협력',
  // 건강
  '운동': '건강', '헬스': '건강', '병원': '건강', '건강': '건강', '약': '건강', '요가': '건강', '산책': '건강', '달리기': '건강',
  // 쇼핑
  '쇼핑': '쇼핑', '구매': '쇼핑', '주문': '쇼핑', '배송': '쇼핑', '장보기': '쇼핑',
  // 개인
  '집': '개인', '청소': '개인', '빨래': '개인', '요리': '개인', '설거지': '개인', '정리': '개인',
};

// 중요도 키워드
const IMPORTANT_KEYWORDS = ['중요', '급함', '긴급', '별표', 'ASAP', '우선', '급한', '시급', '필수', '꼭'];

// 마감일 패턴
const DUE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /오늘까지|오늘\s*마감/, label: '오늘까지' },
  { pattern: /내일까지|내일\s*마감/, label: '내일까지' },
  { pattern: /이번\s*주까지|금주까지/, label: '이번 주까지' },
  { pattern: /다음\s*주까지|차주까지/, label: '다음 주까지' },
];

/**
 * 카테고리 이름으로 CategoryInfo를 조회합니다.
 */
function getCategoryByName(name: string): CategoryInfo {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1]; // fallback: 일반
}

/**
 * CategoryInfo를 Tailwind 클래스 문자열로 변환합니다.
 */
export function categoryToColorClass(cat: CategoryInfo): string {
  return `${cat.bgColor} ${cat.textColor} ${cat.darkBg} ${cat.darkText}`;
}

/**
 * 사용자 입력 텍스트를 분석하여 제목, 카테고리, 중요도, 마감일을 추출합니다.
 */
export function parseTaskInput(input: string): ParsedInput {
  const trimmed = input.trim();

  // 1. 중요도 감지 및 키워드 제거
  let isImportant = false;
  let cleanedTitle = trimmed;

  for (const keyword of IMPORTANT_KEYWORDS) {
    const regex = new RegExp(`${keyword}[!！]*\\s*`, 'gi');
    if (regex.test(cleanedTitle)) {
      isImportant = true;
      cleanedTitle = cleanedTitle.replace(regex, '').trim();
    }
  }

  // 느낌표만 있는 경우도 제거
  cleanedTitle = cleanedTitle.replace(/^[!！]+\s*/, '').replace(/\s*[!！]+$/, '').trim();

  // 2. 마감일 감지 및 제거
  let dueDate: string | undefined;
  for (const { pattern, label } of DUE_PATTERNS) {
    if (pattern.test(cleanedTitle)) {
      dueDate = label;
      cleanedTitle = cleanedTitle.replace(pattern, '').trim();
      break;
    }
  }

  // 3. 시간 범위 감지 (13:00~15:00)
  let startTime: string | undefined;
  let endTime: string | undefined;
  const timeRangeRegex = /(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/;
  const match = cleanedTitle.match(timeRangeRegex);
  if (match) {
    startTime = match[1];
    endTime = match[2];
    cleanedTitle = cleanedTitle.replace(timeRangeRegex, '').replace(/\s*\/\s*$/, '').trim();
  }

  // 4. 카테고리 감지 (키워드 매핑)
  let detectedCategory = '일반';
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (trimmed.toLowerCase().includes(keyword.toLowerCase())) {
      detectedCategory = category;
      break;
    }
  }

  const category = getCategoryByName(detectedCategory);

  // 5. 제목이 비어있으면 원본 사용
  if (!cleanedTitle) {
    cleanedTitle = trimmed;
  }

  return {
    title: cleanedTitle,
    category,
    isImportant,
    dueDate,
    startTime,
    endTime,
  };
}

/**
 * 모든 카테고리 목록을 반환합니다.
 */
export function getAllCategories(): CategoryInfo[] {
  return CATEGORIES;
}
