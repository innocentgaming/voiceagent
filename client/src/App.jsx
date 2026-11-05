import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import ProjectWorkspace from './components/workspace/ProjectWorkspace';
import LiveStudio from './components/studio/LiveStudio';
import TestHistory from './components/history/TestHistory';
import EnterpriseStudio from './components/governance/EnterpriseStudio';
import EvaluationModal from './components/evaluation/EvaluationModal';
import CreateProjectModal from './components/CreateProjectModal';
import CreateTestCaseModal from './components/CreateTestCaseModal';
import AuthModal from './components/auth/AuthModal';
import AnalyticsCharts from './components/dashboard/AnalyticsCharts';
import SettingsPage from './components/settings/SettingsPage';
import Toast from './components/common/Toast';
import Card from './components/common/Card';
import Badge from './components/common/Badge';
import Button from './components/common/Button';
import { Settings, ShieldCheck, CheckCircle2, Cpu, Key, Database, RefreshCw } from 'lucide-react';

export default function App() {
  const validTabs = ['dashboard', 'workspace', 'studio', 'history', 'analytics', 'enterprise', 'observability', 'settings'];

  const [theme, setTheme] = useState(() => localStorage.getItem('indic_theme') || 'dark');
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (validTabs.includes(hash)) return hash;
    const saved = localStorage.getItem('indic_active_tab');
    if (saved && validTabs.includes(saved)) return saved;
    return 'dashboard';
  });

  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [historyRuns, setHistoryRuns] = useState([]);

  // Synchronize URL hash with activeTab for browser back/forward and deep linking
  useEffect(() => {
    window.location.hash = activeTab;
    localStorage.setItem('indic_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // When switching to workspace, ensure active project is selected and loaded
  useEffect(() => {
    if (activeTab === 'workspace' && !activeProject && projects.length > 0) {
      const targetId = activeProjectId || projects[0]._id;
      setActiveProjectId(targetId);
      fetchProjectDetails(targetId);
    }
  }, [activeTab, activeProject, projects, activeProjectId]);

  // User Profile & Authentication State (Defaults to unauthenticated guest)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('indic_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Enterprise Toast Notification Center
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals & Inspection
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [inspectedRun, setInspectedRun] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [runningTestId, setRunningTestId] = useState(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Theme switching effect
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('indic_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check auth session on startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('indic_token');
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('indic_user', JSON.stringify(data.user));
        }
      } catch (e) {
        // Fallback to local user
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('indic_token');
    localStorage.removeItem('indic_user');
    setUser(null);
    showToast('Signed out of session', 'info');
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${authenticatedUser.name || 'User'}!`, 'success');
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // When activeProjectId changes, fetch test cases and project history
  useEffect(() => {
    if (activeProjectId) {
      fetchProjectDetails(activeProjectId);
    }
  }, [activeProjectId]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, projRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/projects')
      ]);
      const dashData = await dashRes.json();
      const projData = await projRes.json();

      if (dashData.success) {
        setStats(dashData.data);
      }
      if (projData.success) {
        setProjects(projData.data);
        if (projData.data.length > 0 && !activeProjectId) {
          setActiveProjectId(projData.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const [projRes, testRes, histRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/tests`),
        fetch(`/api/projects/${projectId}/history`)
      ]);
      const proj = await projRes.json();
      const tests = await testRes.json();
      const hist = await histRes.json();

      if (proj.success) setActiveProject(proj.data);
      if (tests.success) setTestCases(tests.data);
      if (hist.success) setHistoryRuns(hist.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    }
  };

  // Switch to Workspace and select project
  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    setActiveTab('workspace');
  };

  // Seed default benchmark data
  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchDashboardData();
        if (data.project) {
          setActiveProjectId(data.project._id);
        }
        showToast('Demo benchmark dataset seeded successfully', 'success');
      }
    } catch (err) {
      console.error('Failed to seed data:', err);
      showToast('Failed to seed demo data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Create Project
  const handleCreateProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateProjectOpen(false);
        await fetchDashboardData();
        setActiveProjectId(data.data._id);
        setActiveTab('workspace');
        showToast(`Project "${projectData.name}" created successfully`, 'success');
      } else {
        showToast(data.message || 'Failed to create project', 'error');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      showToast('Network error while creating project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Test Case
  const handleCreateTestCase = async (testData) => {
    if (!activeProjectId) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', testData.name);
      formData.append('language', testData.language);
      formData.append('category', testData.category);
      formData.append('noiseLevel', testData.noiseLevel);
      formData.append('expectedTranscription', testData.expectedTranscription);
      formData.append('criticalEntities', JSON.stringify(testData.criticalEntities));

      if (testData.audioFile) {
        formData.append('audio', testData.audioFile);
      }

      const res = await fetch(`/api/projects/${activeProjectId}/tests`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateTestOpen(false);
        fetchProjectDetails(activeProjectId);
        fetchDashboardData();
        showToast(`Test case "${testData.name}" registered`, 'success');
      } else {
        showToast(data.message || 'Failed to add test case', 'error');
      }
    } catch (err) {
      console.error('Failed to create test case:', err);
      showToast('Network error while saving test case', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Test Case
  const handleDeleteTestCase = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) return;
    try {
      await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
      fetchProjectDetails(activeProjectId);
      fetchDashboardData();
      showToast('Test case deleted', 'info');
    } catch (err) {
      console.error('Failed to delete test:', err);
      showToast('Failed to delete test case', 'error');
    }
  };

  // Run Single Test Case
  const handleRunTest = async (testId) => {
    setRunningTestId(testId);
    try {
      const res = await fetch(`/api/tests/${testId}/run`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchProjectDetails(activeProjectId);
        fetchDashboardData();
        setInspectedRun(data.data.run);
        showToast('Evaluation run completed with audit report', 'success');
      } else {
        showToast(data.message || 'Evaluation run failed', 'error');
      }
    } catch (err) {
      console.error('Failed to run test:', err);
      showToast('Network error while evaluating audio', 'error');
    } finally {
      setRunningTestId(null);
    }
  };

  // Run All Test Cases in project
  const handleRunAllTests = async (testsToRun) => {
    setIsRunningAll(true);
    let successCount = 0;
    for (const test of testsToRun) {
      try {
        const res = await fetch(`/api/tests/${test._id}/run`, { method: 'POST' });
        const d = await res.json();
        if (d.success) successCount++;
      } catch (err) {
        console.error('Test run failed:', err);
      }
    }
    await fetchProjectDetails(activeProjectId);
    await fetchDashboardData();
    setIsRunningAll(false);
    showToast(`Batch execution finished: ${successCount}/${testsToRun.length} passed`, 'success');
  };

  // View Detailed Run Report
  const handleViewRunDetails = async (runRef) => {
    if (runRef.details && runRef.alignment) {
      setInspectedRun(runRef);
    } else {
      try {
        const res = await fetch(`/api/runs/${runRef._id}`);
        const data = await res.json();
        if (data.success) {
          setInspectedRun(data.data);
        } else {
          setInspectedRun(runRef);
        }
      } catch (err) {
        setInspectedRun(runRef);
      }
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      projects={projects}
      activeProjectId={activeProjectId}
      onSelectProject={handleSelectProject}
      onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      onSeedDemoData={handleSeedDemoData}
      isSeeding={isSeeding}
      theme={theme}
      onToggleTheme={toggleTheme}
      user={user}
      onOpenAuthModal={handleOpenAuth}
      onLogout={handleLogout}
    >
      {/* View 1: Overview Dashboard */}
      {activeTab === 'dashboard' && (
        <Dashboard
          stats={stats}
          projects={projects}
          onSelectProject={handleSelectProject}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onViewRunDetails={handleViewRunDetails}
          loading={isLoading}
          user={user}
        />
      )}

      {/* View 2: Projects Workspace */}
      {activeTab === 'workspace' && (
        <>
          {activeProject ? (
            <ProjectWorkspace
              project={activeProject}
              testCases={testCases}
              onBack={() => setActiveTab('dashboard')}
              onOpenCreateTest={() => setIsCreateTestOpen(true)}
              onRunTest={handleRunTest}
              onRunAllTests={handleRunAllTests}
              onDeleteTest={handleDeleteTestCase}
              onViewRunDetails={handleViewRunDetails}
              runningTestId={runningTestId}
              isRunningAll={isRunningAll}
            />
          ) : (
            <div className="text-center py-20 saas-card p-12">
              <p className="text-sm text-[#697386] dark:text-[#94a3b8] mb-4">
                No active project selected.
              </p>
              <Button onClick={() => setIsCreateProjectOpen(true)} size="md">
                Create First Project
              </Button>
            </div>
          )}
        </>
      )}

      {/* View 3: Live Test Studio */}
      {activeTab === 'studio' && (
        <LiveStudio onViewRunDetails={handleViewRunDetails} />
      )}

      {/* View 4: Test History */}
      {activeTab === 'history' && (
        <TestHistory
          runs={historyRuns.length > 0 ? historyRuns : (stats?.recentRuns || [])}
          onViewRunDetails={handleViewRunDetails}
        />
      )}

      {/* View 5: Analytics & Slices */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
              Deep Analytics & Language Slices
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8]">
              Phonetic degradation curves, grapheme analysis, and multi-slice breakdowns across Indian languages.
            </p>
          </div>
          <AnalyticsCharts stats={stats} />
        </div>
      )}

      {/* View 6: AI Governance Studio */}
      {activeTab === 'enterprise' && (
        <EnterpriseStudio initialSubTab="personas" />
      )}

      {/* View 7: Observability & FinOps */}
      {activeTab === 'observability' && (
        <EnterpriseStudio initialSubTab="observability" />
      )}

      {/* View 8: Settings & Engine Status */}
      {activeTab === 'settings' && (
        <SettingsPage
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAuthModal={handleOpenAuth}
          onShowToast={showToast}
        />
      )}

      {/* Modals */}
      {isCreateProjectOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectOpen(false)}
          onSubmit={handleCreateProject}
          isSubmitting={isSubmitting}
        />
      )}

      {isCreateTestOpen && (
        <CreateTestCaseModal
          projectId={activeProjectId}
          onClose={() => setIsCreateTestOpen(false)}
          onSubmit={handleCreateTestCase}
          isSubmitting={isSubmitting}
        />
      )}

      {inspectedRun && (
        <EvaluationModal
          run={inspectedRun}
          onClose={() => setInspectedRun(null)}
        />
      )}

      {/* Live Enterprise Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Enterprise Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </AppLayout>
  );
}
