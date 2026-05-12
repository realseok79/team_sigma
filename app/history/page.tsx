"use client";

import React from "react";
import { Check, History as HistoryIcon, MoreHorizontal } from "lucide-react";

const historyData = [
  {
    date: "2026년 5월 10일",
    items: [
      { title: "디자인 시스템 리뷰", project: "Flow To-Do", time: "02:30:15" },
      { title: "주간 팀 싱크업", project: "회의", time: "01:00:00" },
    ]
  },
  {
    date: "2026년 5월 9일",
    items: [
      { title: "사용자 흐름 업데이트", project: "디자인", time: "04:15:30" },
    ]
  }
];

export default function HistoryPage() {
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex items-center gap-4">
        <HistoryIcon size={32} className="text-foreground" />
        <h2 className="text-4xl font-bold tracking-tight">히스토리</h2>
      </header>

      <div className="space-y-12">
        {historyData.map((group) => (
          <div key={group.date} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 bg-border rounded-full"></div>
              <h3 className="text-lg font-bold text-foreground/80">{group.date}</h3>
            </div>

            <div className="space-y-3">
              {group.items.map((item, idx) => (
                <div 
                  key={idx}
                  className="group flex items-center justify-between p-6 bg-card-bg border border-border rounded-2xl hover:border-accent/20 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center text-secondary">
                      <Check size={20} strokeWidth={3} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground/90">{item.title}</h4>
                      <p className="text-xs font-medium text-secondary uppercase tracking-wider">{item.project}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <div className="font-digital text-4xl text-foreground/90 tracking-tight">
                        {item.time}
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
    </div>
  );
}
