"use client";

import React from "react";
import { Play, Pause, Square, Clock, Star, Trash2, Gauge, Hourglass, AlertCircle } from "lucide-react";
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

const priorityColors = {
  high: "text-red-500 bg-red-50 dark:bg-red-900/20",
  medium: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  low: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
};

const priorityLabels = {
  high: "우선순위: 상",
  medium: "우선순위: 중",
  low: "우선순위: 하",
};

export function TaskCard({ task, onStart, onPause, onComplete, onDelete, onToggleImportant }: TaskCardProps) {
  const isActive = task.status === "active";
  const isPaused = task.status === "paused";
  const isTodo = task.entryType === "TODO";

  return (
    <div className={`group relative rounded-2xl border transition-all duration-300 ${
      isActive 
        ? "bg-accent/[0.03] border-accent/30 shadow-lg shadow-accent/5 p-8" 
        : "bg-card-bg border-border hover:border-accent/20 hover:shadow-md p-6"
    }`}>
      {/* 중요 표시 바 */}
      {task.isImportant && (
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-amber-400 rounded-full" />
      )}

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold transition-colors ${isActive ? "text-xl text-foreground" : "text-[16px] text-foreground/90"}`}>
              {task.title}
            </h3>
            {!isTodo && task.startTime && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sidebar-bg text-accent uppercase tracking-wider">
                🕒 {task.startTime} {task.endTime ? `- ${task.endTime}` : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {task.category && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.categoryColor}`}>
                {task.category}
              </span>
            )}
            
            {/* TO-DO 전용 뱃지 */}
            {isTodo && (
              <>
                {task.priority && (
                  <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${priorityColors[task.priority]}`}>
                    <AlertCircle size={12} />
                    {priorityLabels[task.priority]}
                  </div>
                )}
                {task.estimatedTime && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-secondary bg-sidebar-bg px-2 py-0.5 rounded uppercase tracking-wider">
                    <Hourglass size={12} />
                    예상: {task.estimatedTime}분
                  </div>
                )}
                {task.difficulty && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-secondary bg-sidebar-bg px-2 py-0.5 rounded uppercase tracking-wider">
                    <Gauge size={12} />
                    난이도: {task.difficulty}
                  </div>
                )}
              </>
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
            <span className="font-digital text-5xl tracking-widest text-foreground min-w-[200px] text-center">
              {formatTime(task.elapsedTime)}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onPause(task.id)}
                className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-foreground hover:bg-border transition-colors"
              >
                <Pause size={18} fill="currentColor" />
              </button>
              <button 
                onClick={() => onComplete(task.id)}
                className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-foreground hover:bg-border transition-colors"
              >
                <Square size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {/* 비활성 상태 액션 */}
        {!isActive && (
          <div className="flex items-center gap-2">
            {/* 중요 토글 */}
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
            {/* 삭제 */}
            <button 
              onClick={() => onDelete(task.id)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-secondary opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <Trash2 size={18} />
            </button>
            {/* 재생 */}
            <button 
              onClick={() => onStart(task.id)}
              className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-secondary opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white"
            >
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
