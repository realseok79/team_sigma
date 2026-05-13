// ==============================
// Team-Sigma: Core Type Definitions
// ==============================

export type TaskStatus = 'pending' | 'active' | 'paused' | 'completed';
export type EntryType = 'TODO' | 'PLAN';
export type PriorityLevel = 'high' | 'medium' | 'low';

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
  
  // 지능형 분류 신규 필드
  entryType: EntryType;
  difficulty?: number;     // 1~5
  estimatedTime?: number;  // 분 단위
  priority?: PriorityLevel;
  startTime?: string;      // HH:mm 형식
  endTime?: string;        // HH:mm 형식
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
  
  // 파싱 결과 확장
  entryType: EntryType;
  difficulty?: number;
  estimatedTime?: number;
  priority?: PriorityLevel;
  startTime?: string;
  endTime?: string;
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
