"use client";

import React from "react";
import { Star, Inbox } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { useTaskContext } from "@/context/TaskContext";

export default function ImportantPage() {
  const { state, dispatch, getImportantTasks } = useTaskContext();
  const importantTasks = getImportantTasks();

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex items-center gap-4">
        <Star size={32} className="text-amber-400" fill="currentColor" />
        <h2 className="text-4xl font-bold tracking-tight">중요한 할 일</h2>
        {importantTasks.length > 0 && (
          <span className="text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
            {importantTasks.length}개
          </span>
        )}
      </header>

      {importantTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center">
            <Inbox size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground/70">중요한 할 일이 없습니다</h3>
          <p className="text-sm text-secondary max-w-sm">
            작업에 별표를 추가하거나, &quot;중요&quot; 키워드를 포함하여<br />
            새 작업을 추가해 보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {importantTasks.map((task) => (
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
      )}
    </div>
  );
}
