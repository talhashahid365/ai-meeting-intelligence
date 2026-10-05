'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { apiRegister, apiLogin } from '@/lib/api';
import Logo from '@/components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await apiRegister(name, email, password);
      await apiLogin(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-200">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create your Hook AI Meeting Intelligence account</p>
        </div>

        {/* Form Glass Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl shadow-indigo-950/10 dark:shadow-indigo-950/30">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-purple-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-indigo-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-violet-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-violet-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 dark:text-cyan-400 hover:text-purple-500 dark:hover:text-cyan-300 font-semibold underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
