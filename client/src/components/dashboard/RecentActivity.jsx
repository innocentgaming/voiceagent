import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Clock,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowRight,
  ShieldAlert,
  Mic2,
  FileText
} from 'lucide-react';

export default function RecentActivity({
  stats,
  projects = [],
  onSelectProject,
  onOpenCreateProject,
  onViewRunDetails
}) {
  const recentRuns = stats?.recentRuns || [];
  const criticalFailures = recentRuns.filter(r => !r.criticalPassed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Column 1: Recent Evaluation Activity (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3457d5] dark:text-[#6a87f5]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#697386] dark:text-[#94a3b8] font-mono">
                Recent Evaluation Activity
              </h3>
            </div>
            <Badge variant="neutral" size="sm">
              {recentRuns.length} Runs Logged
            </Badge>
          </div>

          {recentRuns.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#697386] dark:text-[#94a3b8]">
              No evaluation runs recorded yet. Run a test case or click "Benchmark Demo" to load data.
            </div>
          ) : (
            <div className="divide-y divide-[#e6e9ef] dark:divide-[#1e2638]">
              {recentRuns.slice(0, 5).map((run, idx) => {
                const isPass = run.criticalPassed;
                return (
                  <div
                    key={run._id || idx}
                    onClick={() => onViewRunDetails && onViewRunDetails(run)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[#f8f9fc] dark:hover:bg-[#171d2b] -mx-2 px-2 rounded-[9px] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 ${
                        isPass
                          ? 'bg-[#e8f5ef] dark:bg-[#062d1f] text-[#16865b]'
                          : 'bg-[#fdeeee] dark:bg-[#341111] text-[#d64545]'
                      }`}>
                        {isPass ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>

                      <div className="truncate">
                        <div className="font-semibold text-xs text-[#151923] dark:text-[#f1f5f9] truncate">
                          {run.testName || `Evaluation Run #${idx + 1}`}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#697386] dark:text-[#94a3b8]">
                          <span className="font-mono">{run.language || 'hi-IN'}</span>
                          <span>•</span>
                          <span>{run.createdAt ? new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono text-xs">
                        <div className="font-bold text-[#151923] dark:text-[#f1f5f9]">
                          WER {typeof run.wer === 'number' ? (run.wer).toFixed(1) : '0.0'}%
                        </div>
                        <div className={`text-[10px] font-semibold ${isPass ? 'text-[#16865b]' : 'text-[#d64545]'}`}>
                          {isPass ? 'Entities Match' : 'Entity Mismatch'}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8c97a8]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Latest Critical Failures Alert Card */}
        {criticalFailures.length > 0 && (
          <Card className="border-[#d64545]/30 bg-[#fdeeee]/30 dark:bg-[#341111]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#d64545]">
              <ShieldAlert className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                Latest High-Stakes Entity Failures ({criticalFailures.length})
              </h4>
            </div>
            <p className="text-xs text-[#697386] dark:text-[#94a3b8] leading-relaxed">
              Standard WER can hide zero-tolerance business transaction errors. Inspect these mismatches to verify phonetic replacement.
            </p>
            <div className="space-y-2">
              {criticalFailures.slice(0, 2).map((fail, i) => (
                <div
                  key={i}
                  onClick={() => onViewRunDetails && onViewRunDetails(fail)}
                  className="p-2.5 rounded-[9px] bg-white dark:bg-[#111622] border border-[#d64545]/30 flex items-center justify-between text-xs cursor-pointer hover:border-[#d64545] transition"
                >
                  <div className="truncate">
                    <span className="font-bold text-[#d64545]">{fail.testName || 'UPI Payment Failure'}: </span>
                    <span className="text-[#697386] dark:text-[#94a3b8] truncate font-devanagari">
                      {fail.hypothesis || 'Recipient name / amount dropped'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#d64545] font-bold shrink-0 ml-2">
                    Inspect Report →
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Column 2: Recent Projects & Quick Actions (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Recent Projects List */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#3457d5] dark:text-[#6a87f5]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#697386] dark:text-[#94a3b8] font-mono">
                Active Projects ({projects.length})
              </h3>
            </div>
            <button
              onClick={onOpenCreateProject}
              className="text-xs font-bold text-[#3457d5] dark:text-[#6a87f5] hover:underline cursor-pointer"
            >
              + New
            </button>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project._id}
                onClick={() => onSelectProject(project._id)}
                className="p-3 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] hover:border-[#3457d5]/50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-xs text-[#151923] dark:text-[#f1f5f9] truncate">
                    {project.name}
                  </div>
                  <div className="text-[11px] text-[#697386] dark:text-[#94a3b8] truncate mt-0.5">
                    {project.description || 'Indian-language Voice AI test suite'}
                  </div>
                </div>
                <Badge variant="default" size="sm" className="shrink-0">
                  {project.testCaseCount || 0} tests
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Action Hub */}
        <Card className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#697386] dark:text-[#94a3b8] font-mono">
            Platform Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button
              onClick={onOpenCreateProject}
              variant="outline"
              size="sm"
              icon={FolderKanban}
              className="justify-start"
            >
              New Project
            </Button>
            {projects.length > 0 && (
              <Button
                onClick={() => onSelectProject(projects[0]._id)}
                variant="outline"
                size="sm"
                icon={Play}
                className="justify-start"
              >
                Open Workspace
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

