'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { apiLogin } from '@/lib/api';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiLogin(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@meetingintel.com');
    setPassword('Demo123!');
    setError(null);
    setLoading(true);
    try {
      await apiLogin('demo@meetingintel.com', 'Demo123!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-200">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/10 via-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Access your Hook AI Meeting Intelligence workspace</p>
        </div>

        {/* Form Glass Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl shadow-purple-950/10 dark:shadow-purple-950/30">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-indigo-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-950/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-purple-600 dark:text-cyan-300 border border-purple-200 dark:border-cyan-500/30 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-cyan-400 animate-pulse" />
              Quick Demo Login (Alex Morgan)
            </button>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-purple-600 dark:text-cyan-400 hover:text-purple-500 dark:hover:text-cyan-300 font-semibold underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
