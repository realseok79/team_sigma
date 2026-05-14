// ==============================
// Team-Sigma: Core Type Definitions
// [통합본: 지능형 엔진 + 팀원 기능]
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
  
  // [지능형 엔진] 신규 필드
  entryType: EntryType;
  difficulty?: number;     // 1~5
  estimatedTime?: number;  // 분 단위
  priority?: PriorityLevel;
  startTime?: string;      // HH:mm 형식
  endTime?: string;        // HH:mm 형식

  // [팀원 추가 필드] 연기 기능 등
  postponedCount: number;  // 0-5
  isPostponed: boolean;
  originalDate?: string;   // ISO string of the date it was originally scheduled for
  lastPostponedAt?: string; // ISO string
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
  
  // [지능형 엔진] 파싱 결과 확장
  entryType: EntryType;
  difficulty?: number;
  estimatedTime?: number;
  priority?: PriorityLevel;
  startTime?: string;
  endTime?: string;
}

// [지능형 엔진] API 응답 규격
export type EngineAction = 'CREATE_TASK' | 'CHANGE_THEME';

export interface DifficultyHistory {
  taskTitle: string;
  category: string;
  aiSuggestedDifficulty: number;
  userAdjustedDifficulty: number;
  adjustedAt: string; // ISO Date String
}

export interface EngineResponse {
  action: EngineAction;
  payload: {
    title?: string;
    entryType?: EntryType;
    category?: string;
    priority?: PriorityLevel;
    difficulty?: number;
    estimatedTime?: number;
    startTime?: string;
    endTime?: string;
    dueDate?: string;
    isImportant?: boolean;
    theme?: 'dark' | 'light';
  };
}

// Context state
export interface TaskState {
  tasks: Task[];
  completedTasks: Task[];
  activeTaskId: string | null;
  searchQuery: string;
  theme: 'dark' | 'light';
}

// Context actions
export type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'status' | 'elapsedTime' | 'postponedCount' | 'isPostponed' | 'originalDate' | 'lastPostponedAt'> }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'START_TASK'; payload: { id: string } }
  | { type: 'PAUSE_TASK'; payload: { id: string } }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_IMPORTANT'; payload: { id: string } }
  | { type: 'SET_SEARCH'; payload: { query: string } }
  | { type: 'SET_THEME'; payload: { theme: 'dark' | 'light' } }
  | { type: 'TICK_TIMER' }
  | { type: 'POSTPONE_TASK'; payload: { id: string } }
  | { type: 'LOAD_STATE'; payload: TaskState }
  | { type: 'UPDATE_TASK_DIFFICULTY'; payload: { id: string; newDifficulty: number } };
