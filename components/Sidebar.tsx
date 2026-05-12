"use client";

import React from "react";
import { 
  Sun, 
  Star, 
  History, 
  Settings, 
  HelpCircle,
  LayoutGrid,
  Plus
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTaskContext } from "@/context/TaskContext";

const footerItems = [
  { icon: Settings, label: "설정", href: "/settings" },
  { icon: HelpCircle, label: "고객 지원", href: "/support" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state, getImportantTasks } = useTaskContext();

  const todayCount = state.tasks.length;
  const importantCount = getImportantTasks().length;
  const historyCount = state.completedTasks.length;

  const sidebarItems = [
    { icon: Sun, label: "오늘의 할 일", href: "/", count: todayCount > 0 ? todayCount : undefined },
    { icon: Star, label: "중요한 할 일", href: "/important", count: importantCount > 0 ? importantCount : undefined },
    { icon: History, label: "히스토리", href: "/history", count: historyCount > 0 ? historyCount : undefined },
  ];

  return (
    <aside className="w-64 bg-sidebar-bg border-r border-border flex flex-col h-screen sticky top-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-foreground rounded-lg flex-shrink-0 flex items-center justify-center text-background">
          <LayoutGrid size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Flow To-Do</h1>
      </div>

      <div className="px-4 mb-4">
        <Link href="/">
          <button className="w-full bg-foreground text-background font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm">
            <Plus size={18} />
            <span>새 작업 만들기</span>
          </button>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-card-bg shadow-sm text-foreground" 
                  : "text-secondary hover:text-foreground hover:bg-card-bg/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? "text-accent" : "text-secondary group-hover:text-foreground"} />
                <span className="font-medium text-[15px]">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-accent text-white" : "bg-border text-secondary"}`}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-border space-y-1">
        {footerItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-foreground hover:bg-card-bg/50 transition-all duration-200"
          >
            <item.icon size={20} />
            <span className="font-medium text-[15px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
