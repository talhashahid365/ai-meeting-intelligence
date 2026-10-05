"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export default function Logo({ size = "md", animated = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Hook AI 3D Ribbon Logo Mark */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        {/* Ambient Purple Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 3D Glass Emblem Container */}
        <div className="relative w-full h-full rounded-2xl bg-slate-950 border border-violet-500/40 p-2 flex items-center justify-center shadow-xl shadow-purple-950/40 backdrop-blur-md group-hover:border-violet-400 transition-colors">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Hook AI Curved Ribbon SVG Path */}
            <path
              d="M10 14C10 10.6863 12.6863 8 16 8H26C29.3137 8 32 10.6863 32 14C32 16.5 30.5 18.5 28 19.4L14 24.5C11.5 25.4 10 27.5 10 30C10 33.3137 12.6863 36 16 36H26C29.3137 36 32 33.3137 32 30"
              stroke="url(#sh-ribbon-gradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="14" r="2.5" fill="#FFFFFF" className={animated ? "animate-pulse" : ""} />
            <circle cx="26" cy="30" r="2.5" fill="#E9D5FF" />
            <defs>
              <linearGradient id="sh-ribbon-gradient" x1="8" y1="8" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="0.5" stopColor="#7C3AED" />
                <stop offset="1" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center ${sizeClasses[size]}`}>
        Hook<span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent ml-1">AI</span>
        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-300 bg-purple-950/80 border border-purple-500/40 rounded-full shadow-sm">
          2.0
        </span>
      </span>
    </Link>
  );
}
