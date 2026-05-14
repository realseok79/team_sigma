"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Clock, Star, Trash2, Gauge, Hourglass, AlertCircle, Loader2 } from "lucide-react";
import { Task } from "@/types";
import { useTaskContext } from "@/context/TaskContext";
import { DifficultyEditor } from "./DifficultyEditor";

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
  high: "text-white bg-red-500 shadow-[0_2px_10px_rgba(239,68,68,0.2)]",
  medium: "text-white bg-orange-500 shadow-[0_2px_10px_rgba(249,115,22,0.2)]",
  low: "text-white bg-blue-500 shadow-[0_2px_10_rgba(59,130,246,0.2)]",
};

const priorityLabels = {
  high: "우선순위: 상",
  medium: "우선순위: 중",
  low: "우선순위: 하",
};

export function TaskCard({ task, onStart, onPause, onComplete, onDelete, onToggleImportant }: TaskCardProps) {
  const { currentTime, updateTaskDifficulty, dispatch } = useTaskContext();
  const isActive = task.status === "active";
  const isTodo = task.entryType === "TODO";
  
  const [isHovered, setIsHovered] = useState(false);

  // [행동 데이터 로깅] 호버 체류 시간 측정
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered) {
      interval = setInterval(() => {
        dispatch({ type: "TICK_STAY_TIME", payload: { id: task.id, timeMs: 1000 } });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHovered, task.id, dispatch]);

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

  const [isSplitting, setIsSplitting] = useState(false);

  const postponedStyle = task.isDeferred ? getPostponedColor(task.deferCount) : "";

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
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-2xl border transition-all duration-300 ${task.isAnalyzing ? 'opacity-60' : ''} ${
      isActive 
        ? "bg-accent/[0.03] border-accent/30 shadow-lg shadow-accent/5 p-8" 
        : `${task.isDeferred ? postponedStyle : "bg-card-bg"} ${task.isStuck ? "border-orange-500/50" : "border-border"} hover:border-accent/20 hover:shadow-md p-6`
    }`}>
      {/* 중요 표시 바 */}
      {task.isImportant && !task.isDeferred && (
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-amber-400 rounded-full" />
      )}

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {task.isAnalyzing && <Loader2 size={16} className="animate-spin text-accent" />}
            <h3 className={`font-semibold transition-colors ${isActive ? "text-xl text-foreground" : "text-[16px]"} ${task.isDeferred && task.deferCount >= 3 ? "text-inherit" : "text-foreground/90"}`}>
              {task.title}
              {task.isDeferred && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-secondary/10 text-secondary ml-2">
                  {task.deferCount}회 미룸
                </span>
              )}
              {task.isStuck && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500 text-white ml-2 animate-pulse">
                  <AlertCircle size={10} />
                  STUCK
                </span>
              )}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!task.isDeferred && task.category && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.categoryColor}`}>
                {task.category}
              </span>
            )}

            {task.isDeferred && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white/20">
                미뤄진 작업
              </span>
            )}

            {/* TO-DO 전용 지능형 뱃지 */}
            {isTodo && (
              <>
                {task.priority && (
                  <div className={`flex items-center gap-1.5 text-[12px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${priorityColors[task.priority]}`}>
                    <AlertCircle size={13} strokeWidth={3} />
                    {priorityLabels[task.priority]}
                  </div>
                )}
                {task.estimatedTime && (
                  <div className="flex items-center gap-1.5 text-[12px] font-black text-foreground bg-sidebar-bg border border-border px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    <Hourglass size={13} className="text-accent" strokeWidth={3} />
                    예상: <span className="text-accent">{task.estimatedTime}분</span>
                  </div>
                )}
                {task.difficulty && (
                  <div className="flex items-center gap-4 text-[12px] font-black text-foreground bg-sidebar-bg border border-border px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Gauge size={13} className="text-accent" strokeWidth={3} />
                      난이도
                    </div>
                    <DifficultyEditor 
                      difficulty={task.difficulty} 
                      onChange={(newVal) => updateTaskDifficulty(task.id, newVal)} 
                    />
                  </div>
                )}
              </>
            )}

            {hasTimeRange && (
              <div className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${task.isDeferred && task.deferCount >= 3 ? "text-inherit" : "text-accent"}`}>
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
            {!isActive && task.elapsedTime > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 px-2 py-0.5 rounded uppercase tracking-wider">
                <Hourglass size={12} />
                진행 시간: {formatTimeDisplay(task.elapsedTime)}
              </div>
            )}
        </div>
      </div>

      {/* 악성 태스크(Stuck) 제안 UI */}
      {task.isStuck && (
        <div className="mt-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              ⚠️ 이 작업이 계속 미뤄지고 있네요. 작은 단위로 쪼개볼까요?
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => dispatch({ type: "DISMISS_STUCK_SUGGESTION", payload: { id: task.id } })}
                className="text-[11px] font-bold text-secondary hover:text-foreground px-2 py-1 rounded-md transition-all"
              >
                나중에
              </button>
              <button 
                disabled={isSplitting}
                onClick={async () => {
                  setIsSplitting(true);
                  try {
                    const res = await fetch("/api/split-task", {
                      method: "POST",
                      body: JSON.stringify({
                        taskTitle: task.title,
                        taskCategory: task.category,
                        difficulty: task.difficulty
                      })
                    });
                    const data = await res.json();
                    if (data.subtasks) {
                      dispatch({
                        type: "SPLIT_TASK",
                        payload: {
                          parentId: task.id,
                          subtasks: data.subtasks.map((st: any) => ({
                            title: st.title,
                            category: task.category,
                            categoryColor: task.categoryColor,
                            isImportant: task.isImportant,
                            entryType: "TODO",
                            difficulty: st.difficulty,
                            estimatedTime: st.estimatedTime,
                            priority: task.priority
                          }))
                        }
                      });
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsSplitting(false);
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
              >
                {isSplitting ? <Loader2 size={12} className="animate-spin" /> : <Split size={12} />}
                태스크 분할하기
              </button>
            </div>
          </div>
        </div>
      )}

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
            {!task.isDeferred && (
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
              className={`w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 ${task.isDeferred ? "text-white/70" : "text-secondary"}`}
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => onStart(task.id)}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${
                task.isDeferred 
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
