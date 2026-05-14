import { Task } from "@/types";
import { SortingStrategy } from "./SortingStrategy";

export class DefaultSortingStrategy implements SortingStrategy {
  name = "기본 정렬 (마감일/중요도)";

  sort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // 1. 중요도 우선
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;

      // 2. 미뤄진 상태 우선 (기존 로직 유지)
      if (a.isDeferred && !b.isDeferred) return -1;
      if (!a.isDeferred && b.isDeferred) return 1;

      // 3. 최신 생성일 우선
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}
