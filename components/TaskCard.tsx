"use client";

import React from "react";
import { Play, Pause, Clock, Star, Trash2, Gauge, Hourglass, AlertCircle } from "lucide-react";
import { Task } from "@/types";
import { useTaskContext } from "@/context/TaskContext";

interface TaskCardProps {
  task: Task;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

/**
 * 시간 문자열 "HH:MM"을 오늘 날짜 기준 Date로 변환
 */
function timeStringToDate(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * 초를 HH:MM:SS 형식으로 변환
 */
function formatTimeDisplay(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
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
  const { currentTime } = useTaskContext();
  const isActive = task.status === "active";
  const isTodo = task.entryType === "TODO";

  // 시간 계산
  const hasTimeRange = !!(task.startTime && task.endTime);
  let remainingSeconds = 0;
  let totalDurationSeconds = 0;
  let progressPercent = 0;
  let isOvertime = false;

  if (hasTimeRange) {
    const startDate = timeStringToDate(task.startTime!);
    const endDate = timeStringToDate(task.endTime!);
    totalDurationSeconds = Math.max(0, (endDate.getTime() - startDate.getTime()) / 1000);
    remainingSeconds = Math.max(0, Math.floor((endDate.getTime() - currentTime.getTime()) / 1000));

    if (currentTime >= endDate) {
      isOvertime = true;
      progressPercent = 100;
    } else if (currentTime >= startDate) {
      const elapsed = (currentTime.getTime() - startDate.getTime()) / 1000;
      progressPercent = Math.min(100, (elapsed / totalDurationSeconds) * 100);
    } else {
      progressPercent = 0;
    }
  }

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

  // 프로그레스 바 색상
  const getProgressColor = () => {
    if (isOvertime) return "bg-red-500";
    if (progressPercent > 80) return "bg-orange-500";
    if (progressPercent > 50) return "bg-yellow-500";
    return "bg-accent";
  };

  // 총 예정 시간 표시
  const formatDuration = () => {
    if (!totalDurationSeconds) return "";
    const h = Math.floor(totalDurationSeconds / 3600);
    const m = Math.floor((totalDurationSeconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
  };

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
          <div className="flex flex-wrap items-center gap-3">
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

            {/* TO-DO 전용 지능형 뱃지 */}
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

            {hasTimeRange && (
              <div className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${task.isPostponed && task.postponedCount >= 3 ? "text-inherit" : "text-accent"}`}>
                <Clock size={12} />
                {task.startTime} ~ {task.endTime}
              </div>
            )}
            {hasTimeRange && !isActive && (
              <span className="text-[11px] font-medium text-secondary">
                ({formatDuration()})
              </span>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-500 uppercase tracking-wider">
                <Clock size={12} />
                {task.dueDate}
              </div>
            )}
          </div>
        </div>

        {/* 활성 타임워치 / 타이머 */}
        {isActive && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-6 bg-card-bg border border-border rounded-2xl py-4 px-6 shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">
                  {hasTimeRange ? (isOvertime ? "시간 초과" : "남은 시간") : "소요 시간"}
                </span>
                <span className={`font-digital text-5xl tracking-widest min-w-[220px] text-center ${
                  isOvertime 
                    ? "text-red-500" 
                    : hasTimeRange && remainingSeconds < 300 
                      ? "text-orange-500" 
                      : "text-foreground"
                }`}>
                  {hasTimeRange 
                    ? (isOvertime ? "00:00:00" : formatTimeDisplay(remainingSeconds))
                    : formatTimeDisplay(task.elapsedTime)
                  }
                </span>
              </div>

              {hasTimeRange && (
                <div className="flex flex-col items-center border-l border-border pl-6">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">예정 시간</span>
                  <span className="text-lg font-bold text-foreground/70">
                    {task.startTime} ~ {task.endTime}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 border-l border-border pl-6">
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
                  className="px-5 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  끝냄
                </button>
              </div>
            </div>

            {hasTimeRange && (
              <div className="w-full">
                <div className="w-full h-2 bg-sidebar-bg rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] font-bold text-secondary">{task.startTime}</span>
                  <span className={`text-[10px] font-bold ${isOvertime ? "text-red-500" : "text-secondary"}`}>
                    {isOvertime ? "종료됨" : `${Math.round(progressPercent)}%`}
                  </span>
                  <span className="text-[10px] font-bold text-secondary">{task.endTime}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 비활성 상태 액션 */}
        {!isActive && (
          <div className="flex items-center gap-2">
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
            <button 
              onClick={() => onDelete(task.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 ${task.isPostponed ? "text-white/70" : "text-secondary"}`}
            >
              <Trash2 size={18} />
            </button>
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
