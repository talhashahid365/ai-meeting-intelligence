'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/40 transition-all shadow-sm group ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-purple-600 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
