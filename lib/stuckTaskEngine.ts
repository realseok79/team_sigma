import { Task } from "@/types";

/**
 * 특정 태스크가 'stuck' 상태인지 판별합니다.
 * @param task 판별할 태스크
 * @param now 기준 시각 (테스트 용이성을 위해 주입 가능)
 */
export function isStuckTask(task: Task, now: Date = new Date()): boolean {
  // 이미 완료되었거나 아카이브된 태스크는 제외
  if (task.status === "completed" || task.isArchived) return false;

  const createdAt = new Date(task.createdAt);
  const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  // 쿨오프 기간 체크 (최근 24시간 이내에 거절한 경우 제외)
  if (task.lastDismissedAt) {
    const lastDismissed = new Date(task.lastDismissedAt);
    const hoursSinceDismissed = (now.getTime() - lastDismissed.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDismissed < 24) return false;
  }

  // 1. 과도한 지연 (5회 이상)
  if (task.deferCount >= 5) return true;

  // 2. 조기 감지: 고난도(4점 이상) + 미체류(stayTime 0) + 3일 경과
  const isHighDifficulty = (task.difficulty || 0) >= 4;
  const hasNoStayTime = (task.detailPageStayTime || 0) === 0;
  if (isHighDifficulty && hasNoStayTime && ageInDays >= 3) return true;

  // 3. 일반 장기 방치 (7일 이상)
  if (ageInDays >= 7) return true;

  return false;
}

/**
 * 전체 태스크 배열에서 stuck 태스크들만 추출합니다.
 */
export function getStuckTasks(tasks: Task[], now: Date = new Date()): Task[] {
  return tasks.filter(task => isStuckTask(task, now));
}
