import { Task, PriorityLevel } from "@/types";
import { SortingStrategy } from "./SortingStrategy";

interface StrategyWeights {
  alpha: number; // deferCount
  beta: number;  // difficulty / stayTime
  gamma: number; // AI priority score
}

const DEFAULT_WEIGHTS: StrategyWeights = {
  alpha: 10,
  beta: 5,
  gamma: 2,
};

const EPSILON = 0.001;

const PRIORITY_SCORES: Record<PriorityLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export class AdaptiveSortingStrategy implements SortingStrategy {
  name = "AI 적응형 정렬 (데이터 기반)";
  private weights: StrategyWeights;

  constructor(weights: Partial<StrategyWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  private calculateScore(t: Task): number {
    const D = t.deferCount || 0;
    const C = t.difficulty || 3;
    const T = t.detailPageStayTime || 0;
    const A = t.priority ? PRIORITY_SCORES[t.priority] : 0;

    // S(t) = alpha * D + beta * (C / (T + epsilon)) + gamma * A
    const score = 
      this.weights.alpha * D + 
      this.weights.beta * (C / (T + EPSILON)) + 
      this.weights.gamma * A;

    return score;
  }

  sort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // 1. 진행 중인 태스크는 최상단 고정
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;

      // 2. 점수 기반 정렬 (내림차순)
      return this.calculateScore(b) - this.calculateScore(a);
    });
  }
}
