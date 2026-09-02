"use client";

import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  if (compact) {
    return (
      <button
        onClick={cycleTheme}
        className="w-9 h-9 rounded-md border border-[var(--faint)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
        title={`Current: ${theme} mode (Click to cycle)`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-[var(--accent)]" />
        ) : (
          <Sun className="w-4 h-4 text-[var(--accent)]" />
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-md border border-[var(--faint)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
        title="Theme settings"
        aria-label="Theme settings"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-[var(--accent)]" />
        ) : (
          <Sun className="w-4 h-4 text-[var(--accent)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1.5 rounded-lg border border-[var(--faint)] bg-[var(--paper)] shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              theme === "light"
                ? "text-[var(--accent)] bg-[var(--accent-soft)] font-medium"
                : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              theme === "dark"
                ? "text-[var(--accent)] bg-[var(--accent-soft)] font-medium"
                : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              theme === "system"
                ? "text-[var(--accent)] bg-[var(--accent-soft)] font-medium"
                : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
