// ==============================
// Flow To-Do: Core Type Definitions
// ==============================

export type TaskStatus = 'pending' | 'active' | 'paused' | 'completed';

export interface Task {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  isImportant: boolean;
  status: TaskStatus;
  createdAt: string;       // ISO string for JSON serialization
  completedAt?: string;    // ISO string
  elapsedTime: number;     // 초 단위 누적 시간
  dueDate?: string;        // "오늘까지", "내일까지" 등
}

export interface CategoryInfo {
  name: string;
  bgColor: string;    // light mode bg
  textColor: string;  // light mode text
  darkBg: string;     // dark mode bg
  darkText: string;   // dark mode text
}

export interface ParsedInput {
  title: string;
  category: CategoryInfo;
  isImportant: boolean;
  dueDate?: string;
}

// Context state
export interface TaskState {
  tasks: Task[];
  completedTasks: Task[];
  activeTaskId: string | null;
  searchQuery: string;
}

// Context actions
export type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'status' | 'elapsedTime'> }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'START_TASK'; payload: { id: string } }
  | { type: 'PAUSE_TASK'; payload: { id: string } }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_IMPORTANT'; payload: { id: string } }
  | { type: 'SET_SEARCH'; payload: { query: string } }
  | { type: 'TICK_TIMER' }
  | { type: 'LOAD_STATE'; payload: TaskState };
