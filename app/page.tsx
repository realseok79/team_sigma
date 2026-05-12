"use client";

import React, { useState, useRef } from "react";
import { ListFilter, LayoutGrid, Lightbulb, MoreHorizontal, Plus, Inbox } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { useTaskContext } from "@/context/TaskContext";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch, addTask, getFilteredTasks, getActiveTask } = useTaskContext();

  const handleAddTask = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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
      {taskCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center">
            <Inbox size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground/70">할 일이 없습니다</h3>
          <p className="text-sm text-secondary max-w-sm">
            아래 입력창에 할 일을 입력해 보세요.<br />
            카테고리와 중요도가 자동으로 분류됩니다.
          </p>
        </div>
      )}

      {/* 입력 필드 */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors">
          <Plus size={20} />
        </div>
        <input 
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="새로운 작업을 추가하세요... (예: 중요! 내일 발표 준비하기)"
          className="w-full bg-card-bg border border-border rounded-2xl py-5 pl-14 pr-24 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
        />
        <button 
          onClick={handleAddTask}
          disabled={!inputValue.trim()}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-accent/10 text-accent font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-accent hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          추가
        </button>
      </div>
    </div>
  );
}
