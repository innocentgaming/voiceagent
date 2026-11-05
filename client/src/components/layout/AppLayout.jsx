import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import {
  LayoutDashboard,
  FolderKanban,
  Mic2,
  History,
  BarChart3,
  ShieldCheck,
  Activity,
  Settings
} from 'lucide-react';

export default function AppLayout({
  children,
  activeTab,
  setActiveTab,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenCreateProject,
  onSeedDemoData,
  isSeeding,
  theme,
  onToggleTheme,
  user,
  onOpenAuthModal,
  onLogout
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'workspace', label: 'Projects', icon: FolderKanban },
    { id: 'studio', label: 'Test Studio', icon: Mic2, badge: 'Live' },
    { id: 'history', label: 'Test History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'enterprise', label: 'AI Governance', icon: ShieldCheck },
    { id: 'observability', label: 'Observability', icon: Activity, badge: 'P50/P95' },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex bg-[#f7f8fa] dark:bg-[#0b0e14] text-[#151923] dark:text-[#f1f5f9] transition-colors duration-200">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSeedDemoData={onSeedDemoData}
        isSeeding={isSeeding}
        user={user}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={onSelectProject}
          onOpenCreateProject={onOpenCreateProject}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          user={user}
          onOpenAuthModal={onOpenAuthModal}
          onLogout={onLogout}
        />

        {/* Top Navigation Tab Bar (Accessible Across All Views & Mobile/Desktop) */}
        <div className="border-b border-[#e6e9ef] dark:border-[#1e2638] bg-white/75 dark:bg-[#111622]/75 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2 sticky top-16 z-20 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1.5 min-w-max" aria-label="Global Navigation Tabs">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-150 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] shadow-xs'
                      : 'text-[#697386] dark:text-[#94a3b8] hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] hover:text-[#151923] dark:hover:text-[#f1f5f9]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase font-bold ${
                      isActive ? 'bg-[#3457d5] text-white' : 'bg-[#e6e9ef] dark:bg-[#1e2638] text-[#697386] dark:text-[#94a3b8]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Scrollable Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

