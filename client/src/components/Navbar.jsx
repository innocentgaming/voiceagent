import React from 'react';
import { Layers, Activity, History, Plus, Sparkles, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenCreateProject, 
  onSeedDemoData, 
  isSeeding,
  theme = 'dark',
  onToggleTheme 
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 font-bold text-white text-base tracking-wider font-mono">
            IV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight font-sans">IndicVoice Lab</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Gnani Prisma STT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">Indian-Language Voice Agent Testing & Evaluation Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-sm font-sans">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition font-medium text-xs sm:text-sm ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition font-medium text-xs sm:text-sm ${
              activeTab === 'workspace'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Workspace
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition font-medium text-xs sm:text-sm ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-amber-400" />
            Runs
          </button>

          <button
            onClick={() => setActiveTab('enterprise')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition font-medium text-xs sm:text-sm ${
              activeTab === 'enterprise'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-purple-300 hover:text-purple-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            Enterprise Suite
          </button>
        </nav>

        {/* Actions & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Day / Night Mode Toggle */}
          <button
            onClick={onToggleTheme}
            type="button"
            title={theme === 'dark' ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm flex items-center justify-center cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          <button
            onClick={onSeedDemoData}
            disabled={isSeeding}
            title="Populate with PRD benchmark test cases (UPI Rahul/Rohan, Hindi Amount, Marathi)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isSeeding ? 'Seeding...' : 'Load Benchmarks'}
          </button>

          <button
            onClick={onOpenCreateProject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>

      </div>
    </header>
  );
}
