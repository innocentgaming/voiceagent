import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

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

        {/* Scrollable Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

