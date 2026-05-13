"use client";

import React, { useState, useRef } from "react";
import { ListFilter, LayoutGrid, Lightbulb, MoreHorizontal, Plus, Inbox, Loader2 } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { useTaskContext } from "@/context/TaskContext";
import { parseWithAI } from "@/lib/api";
import { getAllCategories, categoryToColorClass } from "@/lib/categoryEngine";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch, addTask, getFilteredTasks, getActiveTask } = useTaskContext();

  const handleAddTask = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setIsAnalyzing(true);
    try {
      // 1. AI 엔진 호출
      const result = await parseWithAI(trimmed);

      if (result.action === "CREATE_TASK") {
        const { payload } = result;
        
        // 카테고리 정보 가져오기 (컬러 매핑용)
        const categories = getAllCategories();
        const categoryInfo = categories.find(c => c.name === payload.category) || categories[categories.length - 1];

        // 2. 상태 업데이트
        dispatch({
          type: "ADD_TASK",
          payload: {
            title: payload.title || trimmed,
            category: categoryInfo.name,
            categoryColor: categoryToColorClass(categoryInfo),
            isImportant: payload.isImportant || false,
            dueDate: payload.dueDate,
            entryType: payload.entryType || "TODO",
            difficulty: payload.difficulty,
            estimatedTime: payload.estimatedTime,
            priority: payload.priority,
            startTime: payload.startTime,
            endTime: payload.endTime,
          },
        });
      } else if (result.action === "CHANGE_THEME") {
        // AI가 제안한 테마로 변경
        const targetTheme = result.payload.theme || "light";
        dispatch({ type: "SET_THEME", payload: { theme: targetTheme } });
      }

      setInputValue("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("AI Parsing Error:", error);
      // Fallback: 에러 발생 시 기존 로컬 방식으로 추가 (선택 사항)
      addTask(trimmed);
      setInputValue("");
    } finally {
      setIsAnalyzing(false);
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

      {/* 현재 진행 중인 작업 */}
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

      {/* 다음 작업 목록 */}
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
      {taskCount === 0 && !isAnalyzing && (
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

      {/* 입력 필드 */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors">
          {isAnalyzing ? <Loader2 size={20} className="animate-spin text-accent" /> : <Plus size={20} />}
        </div>
        <input 
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnalyzing}
          placeholder={isAnalyzing ? "AI가 내용을 분석하고 있습니다..." : "새로운 작업을 추가하세요... (예: 중요! 내일 발표 준비하기)"}
          className="w-full bg-card-bg border border-border rounded-2xl py-5 pl-14 pr-24 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm disabled:opacity-70"
        />
        <button 
          onClick={handleAddTask}
          disabled={!inputValue.trim() || isAnalyzing}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-accent/10 text-accent font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-accent hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed min-w-[60px] flex justify-center"
        >
          {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : "추가"}
        </button>
      </div>
    </div>
  );
}
