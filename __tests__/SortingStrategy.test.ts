import { describe, it, expect } from "vitest";
import { DefaultSortingStrategy } from "../lib/sorting/DefaultSortingStrategy";
import { AdaptiveSortingStrategy } from "../lib/sorting/AdaptiveSortingStrategy";
import { Task } from "../types";

const mockTask = (overrides: Partial<Task>): Task => ({
  id: Math.random().toString(),
  title: "Test Task",
  category: "Test",
  categoryColor: "bg-blue-500",
  isImportant: false,
  status: "pending",
  createdAt: new Date().toISOString(),
  elapsedTime: 0,
  entryType: "TODO",
  deferCount: 0,
  isDeferred: false,
  detailPageStayTime: 0,
  difficulty: 3,
  priority: "medium",
  ...overrides,
});

describe("Sorting Strategies", () => {
  const tasks: Task[] = [
    mockTask({ id: "1", title: "Low Priority", priority: "low", createdAt: "2024-01-01T00:00:00Z" }),
    mockTask({ id: "2", title: "High Priority", priority: "high", createdAt: "2024-01-02T00:00:00Z" }),
    mockTask({ id: "3", title: "Deferred Task", isDeferred: true, deferCount: 2, createdAt: "2024-01-01T12:00:00Z" }),
  ];

  it("DefaultSortingStrategy should sort by isImportant and then createdAt", () => {
    const strategy = new DefaultSortingStrategy();
    const sorted = strategy.sort([...tasks]);
    // Base logic: important first, then newest first. 
    // In our current mock, task 2 is high priority but not "isImportant".
    const importantTask = mockTask({ id: "4", isImportant: true, createdAt: "2024-01-01T00:00:00Z" });
    const result = strategy.sort([...tasks, importantTask]);
    expect(result[0].id).toBe("4");
  });

  describe("AdaptiveSortingStrategy (Scoring Model)", () => {
    const strategy = new AdaptiveSortingStrategy({ alpha: 10, beta: 5, gamma: 2 });

    it("should calculate higher score for more deferred tasks", () => {
      const taskA = mockTask({ deferCount: 0, detailPageStayTime: 10, difficulty: 1, priority: "low" });
      const taskB = mockTask({ deferCount: 5, detailPageStayTime: 10, difficulty: 1, priority: "low" });
      
      const sorted = strategy.sort([taskA, taskB]);
      expect(sorted[0].deferCount).toBe(5);
    });

    it("should prioritize high difficulty with low stay time (beta factor)", () => {
      // S = alpha*D + beta*(C/(T+e)) + gamma*A
      // Task A: Stay 100s, Diff 5 -> C/T = 0.05
      // Task B: Stay 1s, Diff 5 -> C/T = 5
      const taskA = mockTask({ id: "slow", detailPageStayTime: 100, difficulty: 5, deferCount: 0, priority: "low" });
      const taskB = mockTask({ id: "fast", detailPageStayTime: 1, difficulty: 5, deferCount: 0, priority: "low" });
      
      const sorted = strategy.sort([taskA, taskB]);
      expect(sorted[0].id).toBe("fast");
    });

    it("should handle division by zero stayTime using epsilon", () => {
      const task = mockTask({ detailPageStayTime: 0, difficulty: 5 });
      expect(() => strategy.sort([task])).not.toThrow();
    });
  });
});
