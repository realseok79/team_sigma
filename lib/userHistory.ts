import { DifficultyHistory } from "@/types";

const HISTORY_KEY = "team-sigma-difficulty-history";
const MAX_HISTORY = 15;

/**
 * 로컬 스토리지에서 난이도 수정 이력을 가져옵니다.
 */
export function getDifficultyHistory(): DifficultyHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load difficulty history:", error);
    return [];
  }
}

/**
 * 새로운 난이도 수정 이력을 추가합니다.
 * 최대 개수를 넘으면 가장 오래된 항목부터 삭제합니다.
 */
export function addDifficultyHistory(entry: DifficultyHistory): void {
  if (typeof window === "undefined") return;
  try {
    const history = getDifficultyHistory();
    // 중복 방지 로직 (필요시 추가 가능)
    const updatedHistory = [entry, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save difficulty history:", error);
  }
}
