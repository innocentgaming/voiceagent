import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Mic2,
  History,
  BarChart3,
  ShieldCheck,
  Activity,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  theme,
  onToggleTheme,
  onSeedDemoData,
  isSeeding,
  user,
  onOpenAuthModal
}) {
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AY';
  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'workspace', label: 'Projects', icon: FolderKanban },
        { id: 'studio', label: 'Test Studio', icon: Mic2, badge: 'Live' },
        { id: 'history', label: 'Test History', icon: History }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'enterprise', label: 'AI Governance', icon: ShieldCheck },
        { id: 'observability', label: 'Observability', icon: Activity, badge: 'P50/P95' }
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-[#e6e9ef] dark:border-[#1e2638] bg-white dark:bg-[#111622] flex flex-col justify-between select-none
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top: Brand Header */}
        <div className="flex flex-col">
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <div
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 cursor-pointer overflow-hidden"
              title="IndicVoice Lab - Voice AI Evaluation Platform"
            >
              {/* Brand Logo Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3457d5] via-[#4f70ec] to-[#7c3aed] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#3457d5]/30">
                <Mic2 className="w-5 h-5" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col truncate leading-tight">
                  <span className="font-extrabold text-sm tracking-tight text-[#151923] dark:text-[#f1f5f9]">
                    IndicVoice Lab
                  </span>
                  <span className="text-[10px] font-semibold text-[#697386] dark:text-[#94a3b8] tracking-wider uppercase font-mono">
                    Evaluation Platform
                  </span>
                </div>
              )}
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] text-[#697386] dark:text-[#94a3b8] transition cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items List */}
          <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-extrabold tracking-widest text-[#8c97a8] dark:text-[#64748b] font-mono uppercase mb-1.5">
                    {section.title}
                  </div>
                )}

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-[9px] text-xs font-semibold transition-all duration-150 cursor-pointer relative group
                        ${
                          isActive
                            ? 'bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] shadow-xs'
                            : 'text-[#697386] dark:text-[#94a3b8] hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] hover:text-[#151923] dark:hover:text-[#f1f5f9]'
                        }
                        ${isCollapsed ? 'justify-center px-0' : ''}
                      `}
                    >
                      {/* Left active line indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#3457d5] dark:bg-[#6a87f5]" />
                      )}

                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#3457d5] dark:text-[#6a87f5]'
                            : 'text-[#697386] dark:text-[#94a3b8] group-hover:text-[#151923] dark:group-hover:text-[#f1f5f9]'
                        }`}
                      />

                      {!isCollapsed && (
                        <span className="flex-1 text-left truncate">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase
                            ${
                              isActive
                                ? 'bg-[#3457d5] text-white'
                                : 'bg-[#e6e9ef] dark:bg-[#1e2638] text-[#697386] dark:text-[#94a3b8]'
                            }
                          `}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Theme Switcher & User Profile */}
        <div className="p-3 border-t border-[#e6e9ef] dark:border-[#1e2638] space-y-2">
          {/* Quick Seed Action (Demo Benchmark Data) */}
          {!isCollapsed && (
            <button
              onClick={onSeedDemoData}
              disabled={isSeeding}
              className="w-full flex items-center justify-between p-2 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] text-xs font-semibold text-[#697386] dark:text-[#94a3b8] hover:border-[#3457d5]/40 transition cursor-pointer"
              title="Load Indian Voice Benchmark scenarios (Rahul vs Rohan, 500 vs 5000)"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#3457d5]" />
                <span>Benchmark Demo</span>
              </span>
              <span className="text-[10px] font-mono text-[#3457d5] font-bold">
                {isSeeding ? 'Seeding...' : 'Load'}
              </span>
            </button>
          )}

          {/* Upgraded Day / Night Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between p-2 rounded-[9px] border transition cursor-pointer text-xs font-semibold
              ${
                theme === 'light'
                  ? 'bg-[#ebf0ff] border-[#3457d5]/30 text-[#3457d5]'
                  : 'bg-[#0d121c] border-[#1e2638] text-[#94a3b8] hover:text-[#f1f5f9]'
              }
              ${isCollapsed ? 'justify-center p-2' : ''}
            `}
            title={`Currently in ${theme === 'light' ? 'Day Mode' : 'Night Mode'} — Click to switch`}
          >
            <div className="flex items-center gap-2.5">
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-[#6a87f5] fill-[#6a87f5]/20 shrink-0" />
              )}
              {!isCollapsed && (
                <span>{theme === 'light' ? 'Day Mode' : 'Night Mode'}</span>
              )}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                theme === 'light' ? 'bg-[#3457d5] text-white' : 'bg-[#1a233b] text-[#6a87f5]'
              }`}>
                {theme === 'light' ? 'Light' : 'Dark'}
              </span>
            )}
          </button>

          {/* User Profile Pill (Dynamic Aditya Yadav / Authenticated User) */}
          <div
            onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
            className={`flex items-center gap-2.5 p-2 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] hover:border-[#3457d5]/40 transition cursor-pointer
              ${isCollapsed ? 'justify-center p-1.5' : ''}
            `}
            title="Account & Authentication (Click to manage / switch account)"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3457d5] to-[#7c3aed] text-white font-bold text-[11px] flex items-center justify-center font-mono shrink-0 shadow-xs">
              {userInitials}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate leading-tight">
                <span className="text-xs font-bold text-[#151923] dark:text-[#f1f5f9] truncate">
                  {user?.name || 'Aditya Yadav'}
                </span>
                <span className="text-[10px] text-[#697386] dark:text-[#94a3b8] font-mono truncate">
                  {user?.role || 'Lead Voice AI Researcher'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

