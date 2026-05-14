"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { Bell, AlertCircle, X } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: "info" | "warning";
}

export function NotificationManager() {
  const { state, dispatch } = useTaskContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: "info" | "warning") => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, message, type }]);
    // 5초 후 자동 삭제
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const checkTasks = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      state.tasks.forEach((task) => {
        if (!task.startTime || task.status !== "pending") return;

        const [startH, startM] = task.startTime.split(":").map(Number);
        const startTimeInMinutes = startH * 60 + startM;

        // 1. 시작 5분 전 알림
        if (startTimeInMinutes - currentTimeInMinutes === 5) {
          const notificationMessage = `${task.title} 시작 5분 전입니다.`;
          if (!notifications.some(n => n.message === notificationMessage)) {
             addNotification(notificationMessage, "info");
          }
        }

        // 2. 미루기 로직 (1/3 경과 시)
        if (task.endTime) {
          const [endH, endM] = task.endTime.split(":").map(Number);
          const endTimeInMinutes = endH * 60 + endM;
          const duration = endTimeInMinutes - startTimeInMinutes;
          const threshold = Math.floor(duration / 3);
          
          const lastDeferredDate = task.lastDeferredAt ? new Date(task.lastDeferredAt).toDateString() : null;
          const todayDate = now.toDateString();

          if (currentTimeInMinutes >= startTimeInMinutes + threshold && task.status === "pending" && lastDeferredDate !== todayDate) {
            dispatch({ type: "DEFER_TASK", payload: { id: task.id } });
            addNotification(`${task.title}을(를) 하지 않아 다음날로 미뤘습니다.`, "warning");
          }
        } else {
            // 종료 시간이 없는 경우 시작 시간 30분 경과 시 미룸 (기본값)
            const lastDeferredDate = task.lastDeferredAt ? new Date(task.lastDeferredAt).toDateString() : null;
            const todayDate = now.toDateString();

            if (currentTimeInMinutes >= startTimeInMinutes + 30 && task.status === "pending" && lastDeferredDate !== todayDate) {
                dispatch({ type: "DEFER_TASK", payload: { id: task.id } });
                addNotification(`${task.title}을(를) 하지 않아 다음날로 미뤘습니다.`, "warning");
            }
        }
      });
    };

    const interval = setInterval(checkTasks, 60000); // 1분마다 체크
    checkTasks(); // 즉시 실행

    return () => clearInterval(interval);
  }, [state.tasks, addNotification, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 w-full max-w-md px-4">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`flex items-center justify-between p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
            n.type === "warning" 
              ? "bg-red-500 border-red-600 text-white" 
              : "bg-white/80 backdrop-blur-xl border-white/20 text-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            {n.type === "warning" ? <AlertCircle size={20} /> : <Bell size={20} className="text-accent" />}
            <p className="text-sm font-bold">{n.message}</p>
          </div>
          <button 
            onClick={() => removeNotification(n.id)}
            className="p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
