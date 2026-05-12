"use client";

import React, { useState, useEffect } from "react";
import { Search, Moon, Sun, HelpCircle, Bell, User } from "lucide-react";

export function TopBar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-background border-b border-border sticky top-0 z-10 transition-colors duration-300">
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
        <input
          type="text"
          placeholder="작업 검색..."
          className="w-full bg-sidebar-bg/50 border border-border rounded-full py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
        />
      </div>

      <div className="flex items-center gap-4 ml-8">
        <button 
          onClick={toggleTheme}
          className="p-2 text-secondary hover:text-foreground hover:bg-sidebar-bg rounded-full transition-all"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="p-2 text-secondary hover:text-foreground hover:bg-sidebar-bg rounded-full transition-all">
          <HelpCircle size={20} />
        </button>
        <button className="p-2 text-secondary hover:text-foreground hover:bg-sidebar-bg rounded-full transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>
        <div className="w-10 h-10 rounded-full bg-sidebar-bg flex items-center justify-center overflow-hidden border border-border">
          <User size={24} className="text-secondary mt-2" />
        </div>
      </div>
    </header>
  );
}
