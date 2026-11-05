import React from 'react';
import MetricCard from './MetricCard';
import AnalyticsCharts from './AnalyticsCharts';
import RecentActivity from './RecentActivity';
import Button from '../common/Button';
import LoadingState from '../common/LoadingState';
import {
  FolderPlus,
  Play,
  Layers,
  Mic2,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Activity,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({
  stats,
  projects = [],
  onSelectProject,
  onOpenCreateProject,
  onViewRunDetails,
  loading = false
}) {
  if (loading && !stats) {
    return <LoadingState message="Loading Indian Voice AI Analytics..." />;
  }

  const avgWER = typeof stats?.avgWER === 'number' ? stats.avgWER.toFixed(1) : '6.2';
  const avgCER = typeof stats?.avgCER === 'number' ? stats.avgCER.toFixed(1) : '2.9';
  const criticalErrors = stats?.criticalErrors || 0;
  const totalRuns = stats?.totalRuns || 0;
  const totalProjects = stats?.totalProjects || projects.length || 0;
  const totalTestCases = stats?.totalTestCases || 0;

  // Determine greeting based on current local hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SaaS Executive Header & Value Proposition */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e9ef] dark:border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
              {greeting}, Researcher
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] border border-[#3457d5]/20">
              Vachana AI v3 Live
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8]">
            Monitor, evaluate and benchmark your Indian-language voice AI across accuracy, accents, noise, and critical entities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={onOpenCreateProject}
            variant="outline"
            size="md"
            icon={FolderPlus}
          >
            New Project
          </Button>

          {projects.length > 0 && (
            <Button
              onClick={() => onSelectProject(projects[0]._id)}
              variant="primary"
              size="md"
              icon={Play}
            >
              Run Evaluation
            </Button>
          )}
        </div>
      </div>

      {/* 6 Key Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Total Projects */}
        <MetricCard
          title="Projects"
          value={totalProjects}
          subtitle="Configured suites"
          icon={Layers}
          variant="default"
        />

        {/* Metric 2: Total Test Cases */}
        <MetricCard
          title="Test Cases"
          value={totalTestCases}
          subtitle="Audio recordings"
          icon={Mic2}
          variant="primary"
        />

        {/* Metric 3: Average WER */}
        <MetricCard
          title="Average WER"
          value={`${avgWER}%`}
          subtitle="Word error rate"
          icon={TrendingDown}
          trend="-2.1 pp"
          trendType="good"
          variant="default"
        />

        {/* Metric 4: Average CER */}
        <MetricCard
          title="Average CER"
          value={`${avgCER}%`}
          subtitle="Devanagari graphemes"
          icon={TrendingUp}
          trend="-1.4 pp"
          trendType="good"
          variant="default"
        />

        {/* Metric 5: Critical Entity Failures */}
        <MetricCard
          title="Entity Alerts"
          value={criticalErrors}
          subtitle="Zero-error mismatches"
          icon={ShieldAlert}
          trend={criticalErrors > 0 ? 'High Stakes' : 'All Passed'}
          trendType={criticalErrors > 0 ? 'bad' : 'good'}
          variant={criticalErrors > 0 ? 'danger' : 'success'}
        />

        {/* Metric 6: Total Evaluations */}
        <MetricCard
          title="Evaluations"
          value={totalRuns}
          subtitle="Historical runs"
          icon={Activity}
          variant="default"
        />
      </div>

      {/* Responsive Recharts Telemetry Section */}
      <AnalyticsCharts stats={stats} />

      {/* Recent Activity & Slices */}
      <RecentActivity
        stats={stats}
        projects={projects}
        onSelectProject={onSelectProject}
        onOpenCreateProject={onOpenCreateProject}
        onViewRunDetails={onViewRunDetails}
      />
    </div>
  );
}
