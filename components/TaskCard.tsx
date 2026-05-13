"use client";

import React from "react";
import { Play, Pause, Clock, Star, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { formatTime } from "@/hooks/useTimer";

interface TaskCardProps {
  task: Task;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

export function TaskCard({ task, onStart, onPause, onComplete, onDelete, onToggleImportant }: TaskCardProps) {
  const isActive = task.status === "active";
  const isPaused = task.status === "paused";

  const getPostponedColor = (count: number) => {
    switch (count) {
      case 1: return "bg-green-500 text-white border-green-600 shadow-green-100";
      case 2: return "bg-lime-500 text-white border-lime-600 shadow-lime-100";
      case 3: return "bg-yellow-500 text-black border-yellow-600 shadow-yellow-100";
      case 4: return "bg-red-500 text-white border-red-600 shadow-red-100";
      case 5: return "bg-red-900 text-white border-red-950 shadow-red-200";
      default: return "";
    }
  };

  const postponedStyle = task.isPostponed ? getPostponedColor(task.postponedCount) : "";

  return (
    <div className={`group relative rounded-2xl border transition-all duration-300 ${
      isActive 
        ? "bg-accent/[0.03] border-accent/30 shadow-lg shadow-accent/5 p-8" 
        : `${task.isPostponed ? postponedStyle : "bg-card-bg"} border-border hover:border-accent/20 hover:shadow-md p-6`
    }`}>
      {/* 중요 표시 바 */}
      {task.isImportant && !task.isPostponed && (
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-amber-400 rounded-full" />
      )}

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold transition-colors ${isActive ? "text-xl text-foreground" : "text-[16px]"} ${task.isPostponed && task.postponedCount >= 3 ? "text-inherit" : "text-foreground/90"}`}>
              {task.title}
              {task.isPostponed && (
                <span className="ml-2 text-xs font-bold opacity-80">
                  ({task.postponedCount}일 미뤄짐)
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {!task.isPostponed && task.category && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.categoryColor}`}>
                {task.category}
              </span>
            )}
            {task.isPostponed && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white/20">
                미뤄진 작업
              </span>
            )}
            {(task.startTime || task.endTime) && (
              <div className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${task.isPostponed && task.postponedCount >= 3 ? "text-inherit" : "text-accent"}`}>
                <Clock size={12} />
                {task.startTime && task.endTime ? `${task.startTime} ~ ${task.endTime}` : (task.startTime || task.endTime)}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-500 uppercase tracking-wider">
                <Clock size={12} />
                {task.dueDate}
              </div>
            )}
            {isPaused && task.elapsedTime > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-secondary">
                <Clock size={12} />
                {formatTime(task.elapsedTime)}
              </div>
            )}
          </div>
        </div>

        {/* 활성 타이머 */}
        {isActive && (
          <div className="flex items-center gap-8 bg-card-bg border border-border rounded-full py-2 px-6 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">경과 시간</span>
              <span className="font-digital text-5xl tracking-widest text-foreground min-w-[200px] text-center">
                {formatTime(task.elapsedTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onPause(task.id)}
                title="일시정지"
                className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-foreground hover:bg-border transition-colors"
              >
                <Pause size={18} fill="currentColor" />
              </button>
              <button 
                onClick={() => onComplete(task.id)}
                title="끝냄"
                className="px-4 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm hover:bg-accent/90 transition-colors"
              >
                끝냄
              </button>
            </div>
          </div>
        )}

        {/* 비활성 상태 액션 */}
        {!isActive && (
          <div className="flex items-center gap-2">
            {/* 중요 토글 */}
            {!task.isPostponed && (
              <button 
                onClick={() => onToggleImportant(task.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  task.isImportant 
                    ? "text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
                    : "text-secondary opacity-0 group-hover:opacity-100 hover:bg-sidebar-bg"
                }`}
              >
                <Star size={18} fill={task.isImportant ? "currentColor" : "none"} />
              </button>
            )}
            {/* 삭제 */}
            <button 
              onClick={() => onDelete(task.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 ${task.isPostponed ? "text-white/70" : "text-secondary"}`}
            >
              <Trash2 size={18} />
            </button>
            {/* 시작하기 버튼 */}
            <button 
              onClick={() => onStart(task.id)}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${
                task.isPostponed 
                  ? "bg-white/20 text-white hover:bg-white/30" 
                  : "bg-accent/10 text-accent hover:bg-accent hover:text-white"
              }`}
            >
              <Play size={16} fill="currentColor" />
              시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
