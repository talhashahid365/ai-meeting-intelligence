'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  UploadCloud,
  LogOut,
  Search,
  Sparkles,
} from 'lucide-react';
import { apiGetMe, removeToken } from '@/lib/api';
import { User } from '@/types';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    apiGetMe()
      .then(setUser)
      .catch(() => {
        // Ignored if public page
      });
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/meetings?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/meetings', label: 'Meetings', icon: FolderKanban },
    { href: '/upload', label: 'Upload Studio', icon: UploadCloud },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* SalesHook Style 3D Logo */}
        <Logo size="md" />

        {/* Navigation links matching reference */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-purple-600/10 dark:bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-60">
          <Search className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400/80 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search AI meetings..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </form>

        {/* User / Auth CTA + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-[1px]">
                <div className="w-full h-full rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                Log in
              </Link>
              <Link
                href="/upload"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 border border-purple-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Launch Zera AI
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
