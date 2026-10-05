'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Brain, ArrowRight, Zap, Target, Shield, Sparkles, CheckCircle2, MessageSquare, Layers } from 'lucide-react';
import { getToken } from '@/lib/api';
import Logo from '@/components/Logo';

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] md:h-[560px] rounded-3xl border border-slate-800 bg-slate-950/80 flex items-center justify-center text-cyan-400 font-medium">
      Loading 3D Scene...
    </div>
  ),
});

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white flex flex-col justify-between overflow-x-hidden transition-colors duration-200">
      {/* Background Soft Volumetric Mesh Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#a855f715,transparent_50%),radial-gradient(circle_at_80%_20%,#6366f115,transparent_40%)] dark:bg-[radial-gradient(circle_at_50%_0%,#4c1d9525,transparent_50%),radial-gradient(circle_at_80%_20%,#3b076420,transparent_40%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e1b4b15_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/60 backdrop-blur-2xl bg-white/70 dark:bg-slate-950/70">
        <Logo size="lg" />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
          >
            Log in
          </Link>
          <Link
            href="/upload"
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:-translate-y-0.5 border border-purple-400/30"
          >
            Zera AI Chat
          </Link>
        </div>
      </header>

      {/* SalesHook Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* SalesHook Style Top Floating Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-bold mb-8 shadow-lg dark:shadow-2xl dark:shadow-purple-950/60 backdrop-blur-xl">
          <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-current animate-pulse" />
          <span>AI Speech & Video Intelligence • Grounded RAG 2.0 Compliant</span>
        </div>

        {/* SalesHook Hero Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center max-w-4xl leading-[1.08] mb-6">
          Analyze meetings faster.<br />
          Or by voice.<br />
          <span className="bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 dark:from-purple-400 dark:via-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            All in one platform.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Upload meeting audio or video recordings to ZeraAI — she synthesizes executive summaries, speaker transcripts, action items with assigned owners, deadlines, and grounded RAG Q&amp;A in one app.
        </p>

        {/* SalesHook Style Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 border border-purple-400/30"
          >
            Start 7 days free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/meetings"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-sm backdrop-blur-xl shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-current" />
            Watch Live Demo
          </Link>
        </div>

        {/* 3D Volumetric Fluid Canvas Scene */}
        <div className="w-full mb-20">
          <Hero3D />
        </div>

        {/* Feature Cards matching SalesHook aesthetic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="group relative p-8 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg dark:shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              Action Items & Assigned Owners
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automatically extract tasked team members and resolve natural date mentions (&quot;by Friday&quot;) into accurate deadlines.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative p-8 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-violet-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg dark:shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-500/40 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
              Seekable Clickable Timestamps
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click any extracted key point, decision, or transcript line to immediately jump audio and video playback to that exact second.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative p-8 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg dark:shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              Grounded RAG Q&amp;A Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Query ZeraAI assistant grounded strictly in meeting context, supported by vector embeddings with refusal logic for non-meeting questions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <Logo size="sm" />
        <div>Hook AI &copy; 2026. Production Grade Architecture.</div>
      </footer>
    </div>
  );
}
