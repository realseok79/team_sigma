"use client";

import React from "react";
import { ListFilter, LayoutGrid, Lightbulb, MoreHorizontal, Plus } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";

export default function Home() {
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight">오늘</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <ListFilter size={20} />
          </button>
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <LayoutGrid size={20} />
          </button>
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <Lightbulb size={20} />
          </button>
          <button className="p-2 text-secondary hover:text-foreground transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      <section className="space-y-6">
        <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">현재 진행 중인 작업</h3>
        <TaskCard 
          title="클라이언트 미팅 준비 (자료 취합)"
          tag="외부 협력"
          isActive={true}
          time="00:45:12"
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">다음 작업</h3>
        <div className="space-y-3">
          <TaskCard 
            title="보고서 제출 및 피드백 요청"
            tag="교육"
            tagColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            due="오늘까지"
          />
          <TaskCard 
            title="내부 검토용 제안서 초안 작성"
            tag="프레젠테이션"
            tagColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
        </div>
      </section>

      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors">
          <Plus size={20} />
        </div>
        <input 
          type="text"
          placeholder="새로운 작업을 추가하세요..."
          className="w-full bg-card-bg border border-border rounded-2xl py-5 pl-14 pr-24 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
        />
        <button className="absolute right-6 top-1/2 -translate-y-1/2 bg-accent/10 text-accent font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-accent hover:text-white transition-all">
          추가
        </button>
      </div>
    </div>
  );
}
