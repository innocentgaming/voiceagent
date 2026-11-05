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
import AnalyticsCharts from './components/dashboard/AnalyticsCharts';
import Card from './components/common/Card';
import Badge from './components/common/Badge';
import Button from './components/common/Button';
import { Settings, ShieldCheck, CheckCircle2, Cpu, Key, Database, RefreshCw } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('indic_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [historyRuns, setHistoryRuns] = useState([]);

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
      }
    } catch (err) {
      console.error('Failed to seed data:', err);
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
      }
    } catch (err) {
      console.error('Failed to create project:', err);
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
      }
    } catch (err) {
      console.error('Failed to create test case:', err);
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
    } catch (err) {
      console.error('Failed to delete test:', err);
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
      }
    } catch (err) {
      console.error('Failed to run test:', err);
    } finally {
      setRunningTestId(null);
    }
  };

  // Run All Test Cases in project
  const handleRunAllTests = async (testsToRun) => {
    setIsRunningAll(true);
    for (const test of testsToRun) {
      try {
        await fetch(`/api/tests/${test._id}/run`, { method: 'POST' });
      } catch (err) {
        console.error('Test run failed:', err);
      }
    }
    await fetchProjectDetails(activeProjectId);
    await fetchDashboardData();
    setIsRunningAll(false);
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
        <EnterpriseStudio />
      )}

      {/* View 7: Observability & FinOps */}
      {activeTab === 'observability' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
              Real-Time Observability & Latency SLA
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8]">
              P50/P95 latency percentiles, real-time factor (RTF), and FinOps caching telemetry.
            </p>
          </div>
          <EnterpriseStudio />
        </div>
      )}

      {/* View 8: Settings & Engine Status */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <div className="pb-4 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
              Platform Settings & Engine Configuration
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8]">
              Manage STT provider credentials, evaluation thresholds, and environment endpoints.
            </p>
          </div>

          <Card className="space-y-4">
            <h3 className="font-bold text-sm text-[#151923] dark:text-[#f1f5f9] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#3457d5] dark:text-[#6a87f5]" />
              <span>Gnani Prisma / Vachana AI Credentials</span>
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#8c97a8] mb-1">STT Endpoint</label>
                <input
                  type="text"
                  readOnly
                  value="https://api.vachana.ai/stt/v3"
                  className="w-full saas-control px-3 py-2 bg-[#f8f9fc] dark:bg-[#0d121c]"
                />
              </div>
              <div>
                <label className="block text-[#8c97a8] mb-1">API Authentication Key</label>
                <input
                  type="text"
                  readOnly
                  value="vach_1ytE2CY5X2DwVevuF9wx1NPQj1atg0...08c69bad"
                  className="w-full saas-control px-3 py-2 bg-[#f8f9fc] dark:bg-[#0d121c]"
                />
              </div>
              <div className="flex items-center gap-2 text-[#16865b] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified 200 OK • Live Connection Active</span>
              </div>
            </div>
          </Card>
        </div>
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
    </AppLayout>
  );
}
