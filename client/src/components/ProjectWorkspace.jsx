import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Volume2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Filter, 
  Languages, 
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function ProjectWorkspace({
  project,
  testCases,
  onBack,
  onOpenCreateTest,
  onRunTest,
  onRunAllTests,
  onDeleteTest,
  onViewRunDetails,
  runningTestId,
  isRunningAll
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTests = testCases.filter((tc) => {
    const langMatch = selectedLanguage === 'all' || tc.language?.toLowerCase() === selectedLanguage.toLowerCase();
    const catMatch = selectedCategory === 'all' || tc.category?.toLowerCase() === selectedCategory.toLowerCase();
    return langMatch && catMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {project.category || 'voice-agent'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{project.description || 'No description provided.'}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onRunAllTests(filteredTests)}
            disabled={isRunningAll || filteredTests.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
          >
            {isRunningAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run All ({filteredTests.length})</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenCreateTest}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test Case</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
        
        {/* Language Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Languages className="w-3.5 h-3.5" />
            Language:
          </span>
          {['all', 'hindi', 'marathi', 'hinglish'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition ${
                selectedLanguage === lang
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Scenario:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Scenarios</option>
            <option value="numbers/amounts">Numbers / Amounts</option>
            <option value="names/addresses">Names / Addresses</option>
            <option value="regional pronunciation">Regional Pronunciation</option>
            <option value="background noise">Background Noise</option>
            <option value="negation/corrections">Negation / Corrections</option>
          </select>
        </div>

      </div>

      {/* Test Cases List */}
      {filteredTests.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <Volume2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No test cases match this filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload an audio recording, specify expected transcripts, and define critical entities to test Gnani Prisma STT.
          </p>
          <button
            onClick={onOpenCreateTest}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Test Case
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => {
            const lastRun = test.lastRunResult;
            const isRunning = runningTestId === test._id;

            return (
              <div
                key={test._id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  
                  {/* Left: Title & Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-sm">{test.name}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {test.language}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {test.category}
                      </span>
                      {test.noiseLevel && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300/80">
                          {test.noiseLevel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-[11px] text-slate-300">{test.audioOriginalName || test.audioFile}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRunTest(test._id)}
                      disabled={isRunning || isRunningAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition border border-slate-700 hover:border-indigo-500 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Run STT</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteTest(test._id)}
                      title="Delete Test Case"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expected Transcript & Critical Entities */}
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-medium">Expected Transcript: </span>
                    <span className="text-slate-200 font-serif italic">"{test.expectedTranscription}"</span>
                  </div>

                  {test.criticalEntities && test.criticalEntities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
                      <span className="text-[11px] text-slate-400 font-medium">Critical Entities:</span>
                      {test.criticalEntities.map((ent, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-medium"
                        >
                          {ent.name}: <strong className="text-white">{ent.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Last Run Evaluation Card */}
                {lastRun && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400">WER: </span>
                        <span className={`font-mono font-bold ${lastRun.wer <= 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {lastRun.wer}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">CER: </span>
                        <span className="font-mono text-slate-300 font-semibold">{lastRun.cer}%</span>
                      </div>
                      <div>
                        {lastRun.hasCriticalMismatch ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            <ShieldAlert className="w-3 h-3" />
                            CRITICAL ENTITY MISMATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            CRITICAL ENTITIES VERIFIED
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onViewRunDetails({ _id: lastRun.runId })}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Inspect Full Report →
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

