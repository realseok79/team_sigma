"use client";

import React, { useState, useRef } from "react";
import { ListFilter, LayoutGrid, Lightbulb, MoreHorizontal, Plus, Inbox, Loader2, Clock } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { useTaskContext } from "@/context/TaskContext";
import { parseWithAI } from "@/lib/api";
import { getAllCategories, categoryToColorClass } from "@/lib/categoryEngine";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // [Step 6] 팀원이 구현한 수동 시간 설정 필드
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch, addTask, getFilteredTasks, getActiveTask } = useTaskContext();

  const handleAddTask = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // [핵심 개선] 즉시 확정 (Instant Confirmation)
    // 로컬 엔진으로 즉시 분석하여 화면에 바로 추가합니다.
    const tempId = addTask(trimmed, startTime, endTime);
    
    // AI 로딩 상태를 로컬 UI state에서는 즉시 해제하여 사용자가 '확정'되었다고 느끼게 함
    setIsAnalyzing(false); 

    // 입력창 즉시 초기화
    setInputValue("");
    setStartTime("");
    setEndTime("");
    setShowTimePicker(false);
    inputRef.current?.focus();

    try {
      // 2단계: AI 분석 비동기 수행 (백그라운드에서 진행)
      // TaskCard 내부적으로 isAnalyzing: true 상태이므로 사용자에게는 분석 중임이 보이지만, 
      // 입력을 막거나 전체 UI를 멈추지 않습니다.
      const result = await parseWithAI(trimmed);

      if (result.action === "CREATE_TASK") {
        const { payload } = result;
        const categories = getAllCategories();
        const categoryInfo = categories.find(c => c.name === payload.category) || categories[categories.length - 1];

        // AI 분석 결과로 작업 내용 강화 (Enhancement)
        dispatch({
          type: "UPDATE_TASK",
          payload: {
            id: tempId,
            data: {
              title: payload.title || trimmed,
              category: categoryInfo.name,
              categoryColor: categoryToColorClass(categoryInfo),
              isImportant: payload.isImportant || false,
              dueDate: payload.dueDate,
              entryType: payload.entryType || "TODO",
              difficulty: payload.difficulty,
              estimatedTime: payload.estimatedTime,
              priority: payload.priority,
              // 수동 설정값은 유지 (사용자 의도 우선)
              startTime: startTime || payload.startTime,
              endTime: endTime || payload.endTime,
              isAnalyzing: false, // 특정 작업의 AI 로딩 종료
            }
          },
        });
      } else if (result.action === "CHANGE_THEME") {
        const targetTheme = result.payload.theme || "light";
        dispatch({ type: "SET_THEME", payload: { theme: targetTheme } });
        dispatch({ type: "DELETE_TASK", payload: { id: tempId } });
      }
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      // AI 실패 시에도 이미 로컬 엔진으로 추가되었으므로 로딩 상태만 해제하고 그대로 유지
      dispatch({ type: "UPDATE_TASK", payload: { id: tempId, data: { isAnalyzing: false } } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnalyzing) {
      e.preventDefault();
      handleAddTask();
    }
  };

  const activeTask = getActiveTask();
  const filteredTasks = getFilteredTasks();
  const pendingTasks = filteredTasks.filter(
    (t) => t.status === "pending" || t.status === "paused"
  );

  const taskCount = state.tasks.length;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-bold tracking-tight">오늘</h2>
          {taskCount > 0 && (
            <span className="text-sm font-bold text-secondary bg-sidebar-bg px-3 py-1 rounded-full">
              {taskCount}개
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 bg-sidebar-bg p-1 rounded-xl border border-border">
          <button 
            onClick={() => dispatch({ type: "SET_SORTING_MODE", payload: { mode: "default" } })}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${state.sortingMode === "default" ? "bg-card-bg text-accent shadow-sm" : "text-secondary hover:text-foreground"}`}
          >
            기본 정렬
          </button>
          <button 
            onClick={() => dispatch({ type: "SET_SORTING_MODE", payload: { mode: "adaptive" } })}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${state.sortingMode === "adaptive" ? "bg-accent text-white shadow-md shadow-accent/20" : "text-secondary hover:text-foreground"}`}
          >
            <Clock size={14} />
            AI 적응형
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <ListFilter size={20} />
          </button>
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <LayoutGrid size={20} />
          </button>
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <Lightbulb size={20} />
          </button>
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* 현재 진행 중인 작업 (팀원 UI 유지) */}
      {activeTask && (
        <section className="space-y-6">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">현재 진행 중인 작업</h3>
          <TaskCard
            task={activeTask}
            onStart={(id) => dispatch({ type: "START_TASK", payload: { id } })}
            onPause={(id) => dispatch({ type: "PAUSE_TASK", payload: { id } })}
            onComplete={(id) => dispatch({ type: "COMPLETE_TASK", payload: { id } })}
            onDelete={(id) => dispatch({ type: "DELETE_TASK", payload: { id } })}
            onToggleImportant={(id) => dispatch({ type: "TOGGLE_IMPORTANT", payload: { id } })}
          />
        </section>
      )}

      {/* 다음 작업 목록 (팀원 UI 유지) */}
      {pendingTasks.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">
            {activeTask ? "다음 작업" : "할 일 목록"}
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStart={(id) => dispatch({ type: "START_TASK", payload: { id } })}
                onPause={(id) => dispatch({ type: "PAUSE_TASK", payload: { id } })}
                onComplete={(id) => dispatch({ type: "COMPLETE_TASK", payload: { id } })}
                onDelete={(id) => dispatch({ type: "DELETE_TASK", payload: { id } })}
                onToggleImportant={(id) => dispatch({ type: "TOGGLE_IMPORTANT", payload: { id } })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 빈 상태 */}
      {taskCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center">
            <Inbox size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground/70">할 일이 없습니다</h3>
          <p className="text-sm text-secondary max-w-sm">
            아래 입력창에 할 일을 입력해 보세요.<br />
            AI가 카테고리와 중요도를 자동으로 분류합니다.
          </p>
        </div>
      )}

      {/* [통합 입력 영역] AI 분석 + [Step 6] 수동 시간 설정 */}
      <div className="bg-card-bg border border-border rounded-2xl shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent">
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors">
            {isAnalyzing ? <Loader2 size={20} className="animate-spin text-accent" /> : <Plus size={20} />}
          </div>
          <input 
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (e.target.value.trim() && !showTimePicker) {
                setShowTimePicker(true);
              }
            }}
            onFocus={() => {
              if (inputValue.trim()) setShowTimePicker(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="새로운 작업을 추가하세요... (예: 중요! 내일 발표 준비하기)"
            className="w-full bg-transparent py-5 pl-14 pr-24 focus:outline-none transition-all text-foreground placeholder:text-secondary/60 disabled:opacity-70"
          />
          {!showTimePicker && (
            <button 
              onClick={handleAddTask}
              disabled={!inputValue.trim()}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-accent/10 text-accent font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-accent hover:text-white transition-all disabled:opacity-40"
            >
              추가
            </button>
          )}
        </div>

        {/* [Step 6] 팀원의 시간대 설정 패널 (수동 설정용) */}
        {showTimePicker && !isAnalyzing && (
          <div className="border-t border-border px-6 py-4 bg-sidebar-bg/30 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                <Clock size={16} />
                시간 수동 설정 (선택사항)
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">시작</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-card-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                </div>
                <span className="text-secondary font-bold text-lg">~</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">종료</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-card-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => {
                  setShowTimePicker(false);
                  setStartTime("");
                  setEndTime("");
                }}
                className="text-sm text-secondary hover:text-foreground transition-colors font-medium"
              >
                닫기
              </button>
              <button 
                onClick={handleAddTask}
                disabled={!inputValue.trim()}
                className="bg-accent text-white font-bold text-sm px-6 py-2 rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                추가
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
