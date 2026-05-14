import { describe, it, expect } from "vitest";
import { isStuckTask } from "../lib/stuckTaskEngine";
import { Task } from "../types";

const mockTask = (overrides: Partial<Task>): Task => ({
  id: "test",
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
  ...overrides,
});

describe("Stuck Task Detection Engine", () => {
  const now = new Date("2024-05-14T20:00:00Z");

  it("should detect stuck task by deferCount >= 5", () => {
    const task = mockTask({ deferCount: 5 });
    expect(isStuckTask(task, now)).toBe(true);
  });

  it("should detect stuck task after 7 days of neglect", () => {
    const task = mockTask({ createdAt: new Date("2024-05-01T20:00:00Z").toISOString() });
    expect(isStuckTask(task, now)).toBe(true);
  });

  it("should detect early stuck if difficulty >= 4 and stayTime is 0 after 3 days", () => {
    const task = mockTask({ 
      createdAt: new Date("2024-05-10T20:00:00Z").toISOString(),
      difficulty: 4,
      detailPageStayTime: 0
    });
    expect(isStuckTask(task, now)).toBe(true);
  });

  it("should NOT detect stuck if stayTime > 0 even if difficulty is high (before 7 days)", () => {
    const task = mockTask({ 
      createdAt: new Date("2024-05-10T20:00:00Z").toISOString(),
      difficulty: 4,
      detailPageStayTime: 10
    });
    expect(isStuckTask(task, now)).toBe(false);
  });

  it("should respect cool-off period (lastDismissedAt < 24h)", () => {
    const task = mockTask({ 
      deferCount: 5,
      lastDismissedAt: new Date("2024-05-14T10:00:00Z").toISOString() // 10시간 전
    });
    expect(isStuckTask(task, now)).toBe(false);
  });

  it("should re-detect after 24h cool-off period", () => {
    const task = mockTask({ 
      deferCount: 5,
      lastDismissedAt: new Date("2024-05-13T10:00:00Z").toISOString() // 34시간 전
    });
    expect(isStuckTask(task, now)).toBe(true);
  });

  it("should NOT detect completed or archived tasks", () => {
    const completed = mockTask({ status: "completed", deferCount: 10 });
    const archived = mockTask({ isArchived: true, deferCount: 10 });
    expect(isStuckTask(completed, now)).toBe(false);
    expect(isStuckTask(archived, now)).toBe(false);
  });
});
