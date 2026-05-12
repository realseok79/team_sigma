"use client";

import React from "react";
import { Check, History as HistoryIcon, MoreHorizontal, Inbox } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { formatTime } from "@/hooks/useTimer";

export default function HistoryPage() {
  const { state } = useTaskContext();

  // 완료된 작업을 날짜별로 그룹핑
  const groupedHistory = state.completedTasks.reduce<
    Record<string, typeof state.completedTasks>
  >((acc, task) => {
    if (!task.completedAt) return acc;
    const date = new Date(task.completedAt);
    const dateKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {});

  const dateGroups = Object.entries(groupedHistory);

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex items-center gap-4">
        <HistoryIcon size={32} className="text-foreground" />
        <h2 className="text-4xl font-bold tracking-tight">히스토리</h2>
        {state.completedTasks.length > 0 && (
          <span className="text-sm font-bold text-secondary bg-sidebar-bg px-3 py-1 rounded-full">
            {state.completedTasks.length}개 완료
          </span>
        )}
      </header>

      {dateGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center">
            <Inbox size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground/70">완료된 작업이 없습니다</h3>
          <p className="text-sm text-secondary max-w-sm">
            작업을 완료하면 이곳에 기록됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {dateGroups.map(([date, items]) => (
            <div key={date} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-border rounded-full"></div>
                <h3 className="text-lg font-bold text-foreground/80">{date}</h3>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="group flex items-center justify-between p-6 bg-card-bg border border-border rounded-2xl hover:border-accent/20 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-secondary">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-foreground/90">{item.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.categoryColor}`}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <div className="font-digital text-4xl text-foreground/90 tracking-tight">
                          {formatTime(item.elapsedTime)}
                        </div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">총 소요 시간</p>
                      </div>
                      <button className="p-2 text-secondary opacity-0 group-hover:opacity-100 transition-all hover:bg-sidebar-bg rounded-full">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
