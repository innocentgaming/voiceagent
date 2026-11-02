import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProjectWorkspace from './components/ProjectWorkspace';
import TestHistory from './components/TestHistory';
import EnterpriseStudio from './components/EnterpriseStudio';
import EvaluationModal from './components/EvaluationModal';
import CreateProjectModal from './components/CreateProjectModal';
import CreateTestCaseModal from './components/CreateTestCaseModal';

export default function App() {
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
        }
      } catch (err) {
        console.error('Failed to fetch run details:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onSeedDemoData={handleSeedDemoData}
        isSeeding={isSeeding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="text-center py-20">
                <p className="text-slate-400">No project selected.</p>
                <button
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs"
                >
                  Create New Project
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <TestHistory
            runs={historyRuns.length > 0 ? historyRuns : (stats?.recentRuns || [])}
            onViewRunDetails={handleViewRunDetails}
          />
        )}

        {activeTab === 'enterprise' && (
          <EnterpriseStudio />
        )}
      </main>

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
    </div>
  );
}
