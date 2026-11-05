import React, { useState, useMemo } from 'react';
import TestFilters from './TestFilters';
import TestCaseCard from './TestCaseCard';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import {
  FolderKanban,
  Plus,
  Play,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Mic2,
  Layers
} from 'lucide-react';

export default function ProjectWorkspace({
  project,
  testCases = [],
  onBack,
  onOpenCreateTest,
  onRunTest,
  onRunAllTests,
  onDeleteTest,
  onViewRunDetails,
  runningTestId,
  isRunningAll
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedScenario, setSelectedScenario] = useState('all');

  // Filter test cases
  const filteredTests = useMemo(() => {
    return testCases.filter((test) => {
      // Search
      const matchesSearch =
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.expectedTranscription.toLowerCase().includes(searchQuery.toLowerCase());

      // Language
      const matchesLang =
        selectedLanguage === 'all' || test.language === selectedLanguage;

      // Scenario
      const matchesScenario =
        selectedScenario === 'all' || test.category === selectedScenario;

      return matchesSearch && matchesLang && matchesScenario;
    });
  }, [testCases, searchQuery, selectedLanguage, selectedScenario]);

  // Statistics calculation for the project
  const totalCount = testCases.length;
  const evaluatedCount = testCases.filter((t) => t.lastRun).length;
  const passedCount = testCases.filter((t) => t.lastRun && t.lastRun.criticalPassed).length;
  const alertCount = testCases.filter((t) => t.lastRun && !t.lastRun.criticalPassed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project Overview Hero Header */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1 rounded-[7px] hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] text-[#697386] dark:text-[#94a3b8] transition cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
              {project.name}
            </h1>
            <Badge variant="primary" size="sm">Active Suite</Badge>
          </div>

          <p className="text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8] max-w-2xl leading-relaxed">
            {project.description || 'Indian-language voice AI test suite benchmarking accuracy, phonetic replacements, and high-stakes entity integrity.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#697386] dark:text-[#94a3b8] font-mono">
            <span>Total Tests: <strong className="text-[#151923] dark:text-[#f1f5f9]">{totalCount}</strong></span>
            <span>•</span>
            <span>Evaluated: <strong className="text-[#3457d5] dark:text-[#6a87f5]">{evaluatedCount}</strong></span>
            <span>•</span>
            <span>Passed: <strong className="text-[#16865b]">{passedCount}</strong></span>
            <span>•</span>
            <span>Entity Alerts: <strong className="text-[#d64545]">{alertCount}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={onOpenCreateTest}
            variant="outline"
            size="md"
            icon={Plus}
          >
            Add Test Case
          </Button>

          {testCases.length > 0 && (
            <Button
              onClick={() => onRunAllTests(filteredTests)}
              variant="primary"
              size="md"
              loading={isRunningAll}
              icon={RotateCw}
            >
              {isRunningAll ? 'Running All Tests...' : 'Run All Evaluations'}
            </Button>
          )}
        </div>
      </Card>

      {/* Filter Bar */}
      <TestFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedScenario={selectedScenario}
        setSelectedScenario={setSelectedScenario}
      />

      {/* Test Cases Grid */}
      {filteredTests.length === 0 ? (
        <EmptyState
          icon={Mic2}
          title={testCases.length === 0 ? 'No test cases in this project yet' : 'No matching test cases found'}
          description={
            testCases.length === 0
              ? 'Upload audio recordings or define expected text with critical entities to start benchmarking voice agents.'
              : 'Try clearing your search query or adjusting your language and scenario filter settings.'
          }
          actionLabel={testCases.length === 0 ? 'Add First Test Case' : undefined}
          onAction={testCases.length === 0 ? onOpenCreateTest : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => (
            <TestCaseCard
              key={test._id}
              test={test}
              onRunTest={onRunTest}
              onDeleteTest={onDeleteTest}
              onViewRunDetails={onViewRunDetails}
              isRunning={runningTestId === test._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

