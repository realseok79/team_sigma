"use client";

import React from "react";
import { Gauge } from "lucide-react";

interface DifficultyEditorProps {
  difficulty: number;
  onChange: (newDifficulty: number) => void;
  readOnly?: boolean;
}

export function DifficultyEditor({ difficulty, onChange, readOnly = false }: DifficultyEditorProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const displayValue = hovered !== null ? hovered : difficulty;

  return (
    <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          type="button"
          disabled={readOnly}
          onClick={(e) => {
            e.stopPropagation();
            onChange(level);
          }}
          onMouseEnter={() => setHovered(level)}
          className={`group relative transition-all duration-200 ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        >
          <div className={`w-3.5 h-6 rounded-[2px] transition-all duration-300 ${
            level <= displayValue
              ? "bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]"
              : "bg-sidebar-bg border border-border"
          } ${!readOnly && level <= (hovered || 0) ? "scale-110 brightness-110" : ""}`} />
          
          {/* 툴팁 */}
          {!readOnly && level === (hovered || difficulty) && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              난이도 {level}
            </span>
          )}
        </button>
      ))}
      {!readOnly && (
        <span className="ml-1 text-[10px] font-bold text-secondary uppercase tracking-wider opacity-60">
          클릭하여 수정
        </span>
      )}
    </div>
  );
}
