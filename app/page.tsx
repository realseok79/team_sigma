"use client";

import React, { useState, useRef } from "react";
import { ListFilter, LayoutGrid, Lightbulb, MoreHorizontal, Plus, Inbox } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { useTaskContext } from "@/context/TaskContext";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch, addTask, getFilteredTasks, getActiveTask } = useTaskContext();

  const handleAddTask = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!startTime || !endTime) return; // 시간 필수
    addTask(trimmed, startTime, endTime);
    setInputValue("");
    setStartTime("");
    setEndTime("");
    setShowTimePicker(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  const canAdd = inputValue.trim() && startTime && endTime;

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
            아래 입력창에서 할 일과 시간대를 설정해 보세요.<br />
            예: 역사공부하기 / 13:00 ~ 15:00
          </p>
        </div>
      )}

      {/* 입력 폼 */}
      <div className="bg-card-bg border border-border rounded-2xl shadow-sm overflow-hidden transition-all">
        {/* 할일 이름 입력 */}
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors">
            <Plus size={20} />
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
            placeholder="새로운 작업을 추가하세요... (예: 역사공부하기)"
            className="w-full bg-transparent py-5 pl-14 pr-6 focus:outline-none transition-all text-foreground placeholder:text-secondary/60"
          />
        </div>

        {/* 시간대 설정 패널 */}
        {showTimePicker && (
          <div className="border-t border-border px-6 py-4 bg-sidebar-bg/30 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                <Clock size={16} />
                시간대 설정
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
              
              {startTime && endTime && (
                <div className="ml-auto text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                  {(() => {
                    const [sh, sm] = startTime.split(":").map(Number);
                    const [eh, em] = endTime.split(":").map(Number);
                    const diff = (eh * 60 + em) - (sh * 60 + sm);
                    if (diff <= 0) return "시간을 확인해주세요";
                    const h = Math.floor(diff / 60);
                    const m = diff % 60;
                    return `${h > 0 ? `${h}시간 ` : ""}${m > 0 ? `${m}분` : ""}`;
                  })()}
                </div>
              )}
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
                취소
              </button>
              <button 
                onClick={handleAddTask}
                disabled={!canAdd}
                className="bg-accent text-white font-bold text-sm px-6 py-2 rounded-xl hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
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
