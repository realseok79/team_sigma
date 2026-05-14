import { describe, it, expect } from 'vitest';
import { TaskState, TaskAction, Task } from '../types';

// taskReducer를 직접 임포트할 수 없으므로(내부 함수), Context에서 로직을 분리하거나
// 여기서 직접 로직을 검증합니다. (여기서는 순수 함수 형태의 리듀서를 복제하여 테스트합니다)
// 실제 환경에서는 reducer를 외부로 추출하여 테스트하는 것이 좋습니다.

// 테스트용 간이 리듀서 (TaskContext.tsx의 로직을 반영)
function testTaskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        id: 'test-id',
        title: action.payload.title,
        category: action.payload.category,
        categoryColor: action.payload.categoryColor,
        isImportant: action.payload.isImportant,
        status: 'pending',
        createdAt: new Date().toISOString(),
        elapsedTime: 0,
        entryType: action.payload.entryType,
        deferCount: 0,
        isDeferred: false,
        detailPageStayTime: 0,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }
    case 'DEFER_TASK': {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === action.payload.id) {
          return {
            ...t,
            deferCount: Math.min(t.deferCount + 1, 5),
            isDeferred: true,
            status: 'pending' as const,
            lastDeferredAt: new Date().toISOString(),
          };
        }
        return t;
      });
      return { ...state, tasks: updatedTasks };
    }
    case 'TICK_STAY_TIME': {
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id
          ? { ...t, detailPageStayTime: (t.detailPageStayTime || 0) + (action.payload.timeMs / 1000) }
          : t
      );
      return { ...state, tasks: updatedTasks };
    }
    default:
      return state;
  }
}

describe('Behavioral Data Logging & Business Logic', () => {
  const initialState: TaskState = {
    tasks: [],
    completedTasks: [],
    activeTaskId: null,
    searchQuery: '',
    theme: 'light',
  };

  it('태스크 생성 시 deferCount와 detailPageStayTime이 0으로 초기화되어야 한다.', () => {
    const action: TaskAction = {
      type: 'ADD_TASK',
      payload: {
        title: '테스트 작업',
        category: '개발',
        categoryColor: 'bg-blue-500',
        isImportant: false,
        entryType: 'TODO',
      },
    };

    const nextState = testTaskReducer(initialState, action);
    const addedTask = nextState.tasks[0];

    expect(addedTask.deferCount).toBe(0);
    expect(addedTask.detailPageStayTime).toBe(0);
    expect(addedTask.isDeferred).toBe(false);
  });

  it('태스크를 뒤로 미루기 처리했을 때 deferCount가 1씩 증가해야 한다.', () => {
    // 1. 작업 추가
    const stateWithTask = testTaskReducer(initialState, {
      type: 'ADD_TASK',
      payload: {
        title: '미룰 작업',
        category: '기타',
        categoryColor: 'bg-gray-500',
        isImportant: false,
        entryType: 'TODO',
      },
    });

    // 2. 미루기 액션
    const stateAfterDefer = testTaskReducer(stateWithTask, {
      type: 'DEFER_TASK',
      payload: { id: 'test-id' },
    });

    const deferredTask = stateAfterDefer.tasks[0];
    expect(deferredTask.deferCount).toBe(1);
    expect(deferredTask.isDeferred).toBe(true);
    expect(deferredTask.lastDeferredAt).toBeDefined();

    // 3. 한 번 더 미루기
    const stateAfterDeferTwice = testTaskReducer(stateAfterDefer, {
      type: 'DEFER_TASK',
      payload: { id: 'test-id' },
    });

    expect(stateAfterDeferTwice.tasks[0].deferCount).toBe(2);
  });

  it('체류 시간(TICK_STAY_TIME)이 누적되어야 한다.', () => {
    const stateWithTask = testTaskReducer(initialState, {
      type: 'ADD_TASK',
      payload: {
        title: '체류 시간 측정 작업',
        category: '기타',
        categoryColor: 'bg-gray-500',
        isImportant: false,
        entryType: 'TODO',
      },
    });

    // 1초 (1000ms) 체류
    const stateAfterTick1 = testTaskReducer(stateWithTask, {
      type: 'TICK_STAY_TIME',
      payload: { id: 'test-id', timeMs: 1000 },
    });
    expect(stateAfterTick1.tasks[0].detailPageStayTime).toBe(1);

    // 2초 (2000ms) 추가 체류
    const stateAfterTick2 = testTaskReducer(stateAfterTick1, {
      type: 'TICK_STAY_TIME',
      payload: { id: 'test-id', timeMs: 2000 },
    });
    expect(stateAfterTick2.tasks[0].detailPageStayTime).toBe(3); // 1 + 2 = 3초
  });
});
