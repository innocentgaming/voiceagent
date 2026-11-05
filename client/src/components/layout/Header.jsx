import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  FolderKanban,
  Plus,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function Header({
  activeTab,
  projects = [],
  activeProjectId,
  onSelectProject,
  onOpenCreateProject,
  theme,
  onToggleTheme,
  onOpenMobileSidebar
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const activeProject = projects.find((p) => p._id === activeProjectId);

  const tabTitles = {
    dashboard: 'Overview',
    workspace: 'Projects Workspace',
    studio: 'Live Test Studio',
    history: 'Test History',
    analytics: 'Analytics & Slices',
    enterprise: 'AI Governance Suite',
    observability: 'Observability & FinOps',
    settings: 'Settings'
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#e6e9ef] dark:border-[#1e2638] bg-white/80 dark:bg-[#111622]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-[9px] hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] text-[#697386] dark:text-[#94a3b8] transition cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#697386] dark:text-[#94a3b8] font-medium truncate">
          <span className="hover:text-[#151923] dark:hover:text-[#f1f5f9] transition">
            IndicVoice Lab
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#8c97a8] shrink-0" />
          <span className="font-semibold text-[#151923] dark:text-[#f1f5f9] truncate">
            {activeProject ? activeProject.name : 'Workspace'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#8c97a8] shrink-0" />
          <span className="text-[#3457d5] dark:text-[#6a87f5] font-semibold truncate">
            {tabTitles[activeTab] || 'Platform'}
          </span>
        </div>
      </div>

      {/* Center: Search Interface */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8c97a8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test cases, audio files, entities, or metrics... (Press /)"
            className="w-full pl-9 pr-8 py-1.5 text-xs saas-control bg-[#f8f9fc] dark:bg-[#0d121c]"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#8c97a8] px-1.5 py-0.5 rounded bg-white dark:bg-[#171d2b] border border-[#e6e9ef] dark:border-[#1e2638] pointer-events-none">
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls: Project Selector, Notifications, Theme, CTA */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-1.5 saas-control px-2.5 py-1 text-xs">
          <FolderKanban className="w-3.5 h-3.5 text-[#3457d5] dark:text-[#6a87f5] shrink-0" />
          <select
            value={activeProjectId || ''}
            onChange={(e) => onSelectProject(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id} className="bg-white dark:bg-[#111622]">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Create Project Button */}
        <Button
          onClick={onOpenCreateProject}
          variant="outline"
          size="sm"
          icon={Plus}
          className="hidden sm:inline-flex"
        >
          New Project
        </Button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-[9px] hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] text-[#697386] dark:text-[#94a3b8] transition relative cursor-pointer"
            title="System Audit Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#d64545] absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-[#111622]" />
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 saas-card p-4 shadow-xl z-50 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e6e9ef] dark:border-[#1e2638]">
                <span className="font-bold text-[#151923] dark:text-[#f1f5f9]">Evaluation Notifications</span>
                <Badge variant="primary" size="sm">2 New</Badge>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-[9px] bg-[#fdeeee] dark:bg-[#341111]/40 border border-[#d64545]/20 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#d64545] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#d64545]">Critical Entity Failure Detected</div>
                    <div className="text-[11px] text-[#697386] dark:text-[#94a3b8]">
                      UPI payment scenario recognized recipient as "Rohan" instead of "Rahul".
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-[9px] bg-[#e8f5ef] dark:bg-[#062d1f]/40 border border-[#16865b]/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16865b] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#16865b]">Gnani Prisma Engine Online</div>
                    <div className="text-[11px] text-[#697386] dark:text-[#94a3b8]">
                      Live STT endpoint responding within p95 312ms latency budget.
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-1 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold text-[#3457d5] hover:underline cursor-pointer"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-[9px] hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] text-[#697386] dark:text-[#94a3b8] transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#3457d5]" />
          )}
        </button>
      </div>
    </header>
  );
}
