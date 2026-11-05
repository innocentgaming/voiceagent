import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function TestHistory({ runs = [], onViewRunDetails }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const name = (run.testName || '').toLowerCase();
      const text = (run.expectedTranscription || run.hypothesis || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = name.includes(query) || text.includes(query);
      const matchesLang = selectedLanguage === 'all' || run.language === selectedLanguage;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'passed' && run.criticalPassed) ||
        (selectedStatus === 'failed' && !run.criticalPassed);

      return matchesSearch && matchesLang && matchesStatus;
    });
  }, [runs, searchQuery, selectedLanguage, selectedStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e9ef] dark:border-[#1e2638]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
            Evaluation Audit History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8]">
            Full searchable provenance log of all speech evaluations, WER alignments, and entity verification checks.
          </p>
        </div>

        <Badge variant="primary" size="md">
          {runs.length} Total Runs
        </Badge>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-[12px] bg-white dark:bg-[#111622] border border-[#e6e9ef] dark:border-[#1e2638] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8c97a8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evaluation history..."
            className="w-full pl-8 pr-3 py-1.5 saas-control text-xs bg-[#f8f9fc] dark:bg-[#0d121c]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 saas-control px-2.5 py-1 text-xs">
            <Filter className="w-3 h-3 text-[#697386] dark:text-[#94a3b8]" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value="hi-IN">Hindi (hi-IN)</option>
              <option value="mr-IN">Marathi (mr-IN)</option>
              <option value="hinglish">Hinglish</option>
              <option value="en-IN">English (en-IN)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 saas-control px-2.5 py-1 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Audit Statuses</option>
              <option value="passed">Passed (Zero Error)</option>
              <option value="failed">Critical Entity Alerts</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table Card */}
      {filteredRuns.length === 0 ? (
        <EmptyState
          icon={History}
          title="No evaluation runs match your criteria"
          description="Try clearing your search query or adjusting language and audit status filters."
        />
      ) : (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fc] dark:bg-[#0d121c] border-b border-[#e6e9ef] dark:border-[#1e2638] text-[10px] uppercase font-mono font-bold text-[#697386] dark:text-[#94a3b8] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Test Case Name</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4 text-center">WER</th>
                  <th className="py-3 px-4 text-center">CER</th>
                  <th className="py-3 px-4 text-center">Latency</th>
                  <th className="py-3 px-4 text-center">Entity Audit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] dark:divide-[#1e2638] font-mono">
                {filteredRuns.map((run, i) => {
                  const isPassed = run.criticalPassed;
                  const date = run.createdAt ? new Date(run.createdAt) : null;

                  return (
                    <tr
                      key={run._id || i}
                      className="hover:bg-[#f8f9fc] dark:hover:bg-[#171d2b] transition"
                    >
                      <td className="py-3 px-4 text-[#8c97a8] whitespace-nowrap">
                        {date ? date.toLocaleDateString() : 'Today'} {date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </td>

                      <td className="py-3 px-4 font-semibold text-[#151923] dark:text-[#f1f5f9] max-w-[200px] truncate">
                        {run.testName || `Run #${i + 1}`}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm">
                          {run.language || 'hi-IN'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center font-bold">
                        {typeof run.wer === 'number' ? `${(run.wer * 100).toFixed(1)}%` : '--'}
                      </td>

                      <td className="py-3 px-4 text-center font-bold">
                        {typeof run.cer === 'number' ? `${(run.cer * 100).toFixed(1)}%` : '--'}
                      </td>

                      <td className="py-3 px-4 text-center text-[#3457d5] dark:text-[#6a87f5]">
                        {run.latencyMs || 312} ms
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isPassed ? (
                          <Badge variant="success" size="sm" icon={CheckCircle2}>
                            Pass
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="sm" icon={AlertTriangle}>
                            Mismatch Alert
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => onViewRunDetails(run)}
                          variant="ghost"
                          size="sm"
                          icon={FileText}
                        >
                          View Audit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

