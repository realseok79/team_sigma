"use client";

import React from "react";
import { Play, Pause, Square, Clock } from "lucide-react";

interface TaskCardProps {
  title: string;
  tag?: string;
  tagColor?: string;
  due?: string;
  isActive?: boolean;
  time?: string;
}

export function TaskCard({ title, tag, tagColor = "bg-blue-100 text-blue-600", due, isActive, time }: TaskCardProps) {
  return (
    <div className={`group relative rounded-2xl border transition-all duration-300 ${
      isActive 
        ? "bg-accent/[0.03] border-accent/30 shadow-lg shadow-accent/5 p-8" 
        : "bg-card-bg border-border hover:border-accent/20 hover:shadow-md p-6"
    }`}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h3 className={`font-semibold transition-colors ${isActive ? "text-xl text-foreground" : "text-[16px] text-foreground/90"}`}>
            {title}
          </h3>
          <div className="flex items-center gap-3">
            {tag && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${tagColor}`}>
                {tag}
              </span>
            )}
            {due && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-500 uppercase tracking-wider">
                <Clock size={12} />
                {due}
              </div>
            )}
          </div>
        </div>

        {isActive && (
          <div className="flex items-center gap-8 bg-card-bg border border-border rounded-full py-2 px-6 shadow-sm">
            <span className="font-digital text-5xl tracking-widest text-foreground min-w-[200px] text-center">
              {time || "00:00:00"}
            </span>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-foreground hover:bg-border transition-colors">
                <Pause size={18} fill="currentColor" />
              </button>
              <button className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-foreground hover:bg-border transition-colors">
                <Square size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {!isActive && (
          <button className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-secondary opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white">
            <Play size={18} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
