"use client";

// ==============================
// Team-Sigma: Global Task State Management
// React Context + useReducer
// [통합본: 지능형 엔진 + 팀원 기능]
// ==============================

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { Task, TaskState, TaskAction } from "@/types";
import { parseTaskInput, categoryToColorClass } from "@/lib/categoryEngine";
import { addDifficultyHistory } from "@/lib/userHistory";
import { DefaultSortingStrategy } from "@/lib/sorting/DefaultSortingStrategy";
import { AdaptiveSortingStrategy } from "@/lib/sorting/AdaptiveSortingStrategy";

// localStorage key
const STORAGE_KEY = "flow-todo-state";

// 초기 상태
const initialState: TaskState = {
  tasks: [],
  completedTasks: [],
  activeTaskId: null,
  searchQuery: "",
  theme: "light",
  sortingMode: "default",
};

// UUID 생성
function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_THEME": {
      return { ...state, theme: action.payload.theme };
    }
    case "ADD_TASK": {
      const newTask: Task = {
        id: action.payload.id || generateId(),
        title: action.payload.title,
        category: action.payload.category,
        categoryColor: action.payload.categoryColor,
        isImportant: action.payload.isImportant,
        status: "pending",
        createdAt: new Date().toISOString(),
        elapsedTime: 0,
        dueDate: action.payload.dueDate,
        
        // [지능형 엔진] 필드
        entryType: action.payload.entryType,
        difficulty: action.payload.difficulty,
        estimatedTime: action.payload.estimatedTime,
        priority: action.payload.priority,
        startTime: action.payload.startTime,
        endTime: action.payload.endTime,

        // [팀원 추가 필드] 연기 기능 등
        deferCount: 0,
        isDeferred: false,
        // [행동 데이터 로깅]
        detailPageStayTime: 0,
        isAnalyzing: action.payload.isAnalyzing,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case "UPDATE_TASK": {
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload.data } : t
      );
      return { ...state, tasks: updatedTasks };
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

    case "DEFER_TASK": {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === action.payload.id) {
          return {
            ...t,
            deferCount: Math.min(t.deferCount + 1, 5),
            isDeferred: true,
            status: "pending" as const,
            lastDeferredAt: new Date().toISOString(),
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

    case "TICK_STAY_TIME": {
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id
          ? { ...t, detailPageStayTime: (t.detailPageStayTime || 0) + (action.payload.timeMs / 1000) }
          : t
      );
      return { ...state, tasks: updatedTasks };
    }

    case "SET_SORTING_MODE": {
      return { ...state, sortingMode: action.payload.mode };
    }

    case "LOAD_STATE": {
      return action.payload;
    }

    case "UPDATE_TASK_DIFFICULTY": {
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id ? { ...t, difficulty: action.payload.newDifficulty } : t
      );
      return { ...state, tasks: updatedTasks };
    }

    default:
      return state;
  }
}

interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  addTask: (input: string, explicitStartTime?: string, explicitEndTime?: string) => string;
  currentTime: Date;
  getFilteredTasks: () => Task[];
  getImportantTasks: () => Task[];
  getActiveTask: () => Task | undefined;
  getPendingTasks: () => Task[];
  updateTaskDifficulty: (id: string, newDifficulty: number) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // localStorage에서 상태 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TaskState;
        const tasksWithPausedActive = (parsed.tasks || []).map((t) => ({
          ...t,
          status: (t.status === "active" ? "paused" : t.status) as any,
          entryType: t.entryType || "TODO", 
        }));
        dispatch({
          type: "LOAD_STATE",
          payload: {
            ...parsed,
            tasks: tasksWithPausedActive,
            completedTasks: (parsed.completedTasks || []).map(t => ({
              ...t,
              entryType: t.entryType || "TODO"
            })),
            activeTaskId: null,
            searchQuery: "",
            theme: parsed.theme || "light",
          },
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // 테마 적용
  useEffect(() => {
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.theme]);

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  // 매초 현재 시각을 갱신 (타임워치용)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (state.activeTaskId) {
        dispatch({ type: "TICK_TIMER" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeTaskId]);

  // 편의 함수들
  const addTask = useCallback(
    (input: string, explicitStartTime?: string, explicitEndTime?: string) => {
      const parsed = parseTaskInput(input);
      const newId = generateId();
      dispatch({
        type: "ADD_TASK",
        payload: {
          id: newId,
          title: parsed.title,
          category: parsed.category.name,
          categoryColor: categoryToColorClass(parsed.category),
          isImportant: parsed.isImportant,
          dueDate: parsed.dueDate,
          entryType: parsed.entryType,
          difficulty: parsed.difficulty,
          estimatedTime: parsed.estimatedTime,
          priority: parsed.priority,
          startTime: explicitStartTime || parsed.startTime,
          endTime: explicitEndTime || parsed.endTime,
          isAnalyzing: true,
        },
      });
      return newId;
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

    const strategy = state.sortingMode === "adaptive" 
      ? new AdaptiveSortingStrategy() 
      : new DefaultSortingStrategy();

    return strategy.sort(tasks);
  }, [state.tasks, state.searchQuery, state.sortingMode]);

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

  const updateTaskDifficulty = useCallback(
    (id: string, newDifficulty: number) => {
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        // 기록 추가
        addDifficultyHistory({
          taskTitle: task.title,
          category: task.category,
          aiSuggestedDifficulty: task.difficulty || 3, // 기존 값이 없으면 기본 3
          userAdjustedDifficulty: newDifficulty,
          adjustedAt: new Date().toISOString(),
        });

        // 상태 업데이트
        dispatch({ type: "UPDATE_TASK_DIFFICULTY", payload: { id, newDifficulty } });
      }
    },
    [state.tasks, dispatch]
  );

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        addTask,
        currentTime,
        getFilteredTasks,
        getImportantTasks,
        getActiveTask,
        getPendingTasks,
        updateTaskDifficulty,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
