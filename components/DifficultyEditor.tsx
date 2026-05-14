"use client";

import React from "react";

interface DifficultyEditorProps {
  difficulty: number;
  onChange: (newDifficulty: number) => void;
  readOnly?: boolean;
}

export function DifficultyEditor({ difficulty, onChange, readOnly = false }: DifficultyEditorProps) {
  return (
    <div className="flex items-center gap-3 w-32 group">
      <div className="relative flex-1 flex items-center h-6">
        {/* 커스텀 슬라이더 트랙 */}
        <div className="absolute w-full h-1.5 bg-sidebar-bg border border-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300 shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]"
            style={{ width: `${(difficulty / 5) * 100}%` }}
          />
        </div>
        
        {/* 실제 input (투명하게 겹침) */}
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={difficulty}
          disabled={readOnly}
          onChange={(e) => {
            e.stopPropagation();
            onChange(parseInt(e.target.value));
          }}
          className={`absolute w-full h-full opacity-0 z-10 ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        />

        {/* 커스텀 슬라이더 썸(Thumb) */}
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-accent rounded-full shadow-md pointer-events-none transition-all duration-200 z-0"
          style={{ 
            left: `calc(${(difficulty / 5) * 100}% - 8px)`,
            transform: "scale(1)",
          }}
        />
      </div>

      {/* 숫자 표시 */}
      <div className="min-w-[20px] text-center">
        <span className="text-[13px] font-black text-accent drop-shadow-sm">
          {difficulty}
        </span>
      </div>

      {!readOnly && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-border/50">
          난이도 조정: {difficulty}
        </div>
      )}
    </div>
  );
}
