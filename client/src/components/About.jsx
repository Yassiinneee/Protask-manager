import React from 'react';
import { 
  CheckCircle2, Zap, ShieldCheck, Users, Database, Sparkles, 
  Layers, Lock, Server, ArrowRight, Activity, Clock, Award, Code2
} from 'lucide-react';
import Logo from './Logo';

export default function About({ onNavigate }) {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-300 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>High-Performance Task Management Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Engineered for Precision, Speed, and Reliability.
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Pro Task Manager is a full-stack project management suite built with enterprise-grade caching, verified multi-user authentication, and real-time analytics.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-xs transition cursor-pointer"
            >
              <span>Get in Touch</span>
            </button>
          </div>
        </div>

        {/* Interactive Logo Showcase Card in Hero */}
        <div className="relative z-10 p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-white/15 transition-all">
          <Logo variant="large" showStatus={false} />
          <div className="text-xs text-indigo-100 font-medium max-w-[200px]">
            Hover to tilt in 3D • Click for dynamic particle burst
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Built with a Modern Technical Stack
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered with layered caching, robust security boundaries, and high-concurrency workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-indigo-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Redis Accelerated Caching</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sub-millisecond query delivery powered by Redis caching. Automatic write-through invalidation ensures your metrics, filters, and task lists stay instantly updated without database bottlenecking.
            </p>
            <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Live cache hit/miss ratio tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant manual & automated flush tools</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-purple-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Verified Security & RBAC</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Multi-tier authentication with real transactional email verification (6-digit OTP & encrypted tokens), bcrypt password hashing, and role-based permissions (User and Administrator).
            </p>
            <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero unverified account dashboard access</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Granular admin moderation controls</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Adaptive Data Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Resilient data persistence layer supporting MongoDB schemas with seamless fallback memory replication when disconnected, guaranteeing continuous uninterrupted operation.
            </p>
            <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Smart task assignment & team visibility</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Multi-criteria filtering & sorting indices</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security in Depth Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security in Depth Architecture</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Defense-in-depth protective mechanisms securing every layer of the application</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
              <Lock className="w-4 h-4" />
              <span>JWT Authentication</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Stateless cryptographically signed tokens with expiration checks, secret validation, and Bearer authorization.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Zap className="w-4 h-4" />
              <span>Express Rate-Limiting</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              IP-based rate-limiting barriers preventing denial-of-service (DoS) bursts, brute-force spamming, and bot scraping.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>HTTP-Only Session Cookies</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Hardened cookie parameters (`httpOnly`, `sameSite`, `secure`) that completely isolate tokens from malicious client scripts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
              <Code2 className="w-4 h-4" />
              <span>HPP & Data Validator</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              HTTP Parameter Pollution (HPP) filters combined with recursive XSS stripping and schema validation for clean requests.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Capabilities</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to orchestrate projects and manage personal workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
              <Clock className="w-4 h-4" />
              <span>Smart Deadlines</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Presets for quick scheduling (+1 day, +3 days, +1 week) and overdue urgency indicators.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs">
              <Users className="w-4 h-4" />
              <span>Delegation & Team</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Assign tasks to specific teammates or mark as public to facilitate collaborative teamwork.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
              <Activity className="w-4 h-4" />
              <span>Progress Analytics</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Visual completion rate rings, priority breakdown chips, and category tags distribution.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Lock className="w-4 h-4" />
              <span>Account Controls</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Comprehensive profile settings with personal age, location, gender, and security credential updates.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Have questions, feedback, or custom requests?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Our engineering and support team is available 24/7 to assist you.</p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition whitespace-nowrap cursor-pointer"
        >
          Contact Support Team
        </button>
      </div>
    </div>
  );
}