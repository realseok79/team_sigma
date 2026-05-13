"use client";

// ==============================
// Flow To-Do: Global Task State Management
// React Context + useReducer
// ==============================

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { Task, TaskState, TaskAction } from "@/types";
import { parseTaskInput, categoryToColorClass } from "@/lib/categoryEngine";

// localStorage key
const STORAGE_KEY = "flow-todo-state";

// 초기 상태
const initialState: TaskState = {
  tasks: [],
  completedTasks: [],
  activeTaskId: null,
  searchQuery: "",
};

// UUID 생성
function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "ADD_TASK": {
      const newTask: Task = {
        id: generateId(),
        title: action.payload.title,
        category: action.payload.category,
        categoryColor: action.payload.categoryColor,
        isImportant: action.payload.isImportant,
        status: "pending",
        createdAt: new Date().toISOString(),
        elapsedTime: 0,
        dueDate: action.payload.dueDate,
        startTime: action.payload.startTime,
        endTime: action.payload.endTime,
        postponedCount: 0,
        isPostponed: false,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case "DELETE_TASK": {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload.id),
        activeTaskId:
          state.activeTaskId === action.payload.id
            ? null
            : state.activeTaskId,
      };
    }

    case "START_TASK": {
      // 다른 활성 작업이 있으면 일시정지 처리
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === action.payload.id) {
          return { ...t, status: "active" as const };
        }
        if (t.status === "active") {
          return { ...t, status: "paused" as const };
        }
        return t;
      });
      return { ...state, tasks: updatedTasks, activeTaskId: action.payload.id };
    }

    case "PAUSE_TASK": {
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id ? { ...t, status: "paused" as const } : t
      );
      return {
        ...state,
        tasks: updatedTasks,
        activeTaskId:
          state.activeTaskId === action.payload.id
            ? null
            : state.activeTaskId,
      };
    }

    case "COMPLETE_TASK": {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (!task) return state;

      const completedTask: Task = {
        ...task,
        status: "completed",
        completedAt: new Date().toISOString(),
      };

      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload.id),
        completedTasks: [completedTask, ...state.completedTasks],
        activeTaskId:
          state.activeTaskId === action.payload.id
            ? null
            : state.activeTaskId,
      };
    }

    case "TOGGLE_IMPORTANT": {
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id
          ? { ...t, isImportant: !t.isImportant }
          : t
      );
      return { ...state, tasks: updatedTasks };
    }

    case "SET_SEARCH": {
      return { ...state, searchQuery: action.payload.query };
    }

    case "POSTPONE_TASK": {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === action.payload.id) {
          return {
            ...t,
            postponedCount: Math.min(t.postponedCount + 1, 5),
            isPostponed: true,
            status: "pending" as const,
            lastPostponedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      return { ...state, tasks: updatedTasks };
    }

    case "TICK_TIMER": {
      if (!state.activeTaskId) return state;
      const updatedTasks = state.tasks.map((t) =>
        t.id === state.activeTaskId
          ? { ...t, elapsedTime: t.elapsedTime + 1 }
          : t
      );
      return { ...state, tasks: updatedTasks };
    }

    case "LOAD_STATE": {
      return action.payload;
    }

    default:
      return state;
  }
}

// Context 타입
interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  addTask: (input: string) => void;
  getFilteredTasks: () => Task[];
  getImportantTasks: () => Task[];
  getActiveTask: () => Task | undefined;
  getPendingTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // localStorage에서 상태 복원 (마운트 시)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TaskState;
        // 활성 타이머는 리셋 (새로고침 시 일시정지 상태로)
        const tasksWithPausedActive = parsed.tasks.map((t) =>
          t.status === "active" ? { ...t, status: "paused" as const } : t
        );
        dispatch({
          type: "LOAD_STATE",
          payload: {
            ...parsed,
            tasks: tasksWithPausedActive,
            activeTaskId: null,
            searchQuery: "",
          },
        });
      }
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage 용량 초과 등 무시
    }
  }, [state]);

  // 타이머 인터벌
  useEffect(() => {
    if (!state.activeTaskId) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeTaskId]);

  // 편의 함수들
  const addTask = useCallback(
    (input: string) => {
      const parsed = parseTaskInput(input);
      dispatch({
        type: "ADD_TASK",
        payload: {
          title: parsed.title,
          category: parsed.category.name,
          categoryColor: categoryToColorClass(parsed.category),
          isImportant: parsed.isImportant,
          dueDate: parsed.dueDate,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
        },
      });
    },
    [dispatch]
  );

  const getFilteredTasks = useCallback(() => {
    let tasks = [...state.tasks];
    
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // 정렬 로직: 미뤄진 일(isPostponed)을 최상단으로, 그 다음 중요도, 그 다음 생성일순
    return tasks.sort((a, b) => {
      if (a.isPostponed && !b.isPostponed) return -1;
      if (!a.isPostponed && b.isPostponed) return 1;
      if (a.isPostponed && b.isPostponed) {
        return b.postponedCount - a.postponedCount; // 많이 미뤄진 순서대로? 아니면 적게? 일단 많이 미뤄진걸 위로
      }
      
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [state.tasks, state.searchQuery]);

  const getImportantTasks = useCallback(() => {
    return state.tasks.filter((t) => t.isImportant);
  }, [state.tasks]);

  const getActiveTask = useCallback(() => {
    return state.tasks.find((t) => t.id === state.activeTaskId);
  }, [state.tasks, state.activeTaskId]);

  const getPendingTasks = useCallback(() => {
    return state.tasks.filter(
      (t) => t.status === "pending" || t.status === "paused"
    );
  }, [state.tasks]);

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        addTask,
        getFilteredTasks,
        getImportantTasks,
        getActiveTask,
        getPendingTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// Hook
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
