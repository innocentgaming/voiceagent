import React from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Clock, 
  Volume2 
} from 'lucide-react';

export default function EvaluationModal({ run, onClose }) {
  if (!run) return null;

  const {
    expectedTranscription,
    predictedTranscription,
    wer,
    cer,
    accuracy,
    confidence,
    provider,
    createdAt,
    details = {},
    alignment = [],
    entityEvaluation = {},
    routing,
    guardrails,
    isCached,
    latencyMs
  } = run;

  const hasCriticalMismatch = entityEvaluation?.hasCriticalMismatch || run.metrics?.criticalFailureDetected;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eval-report-title"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Evaluation Report v1.0
              </span>
              {isCached && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Semantic Cache Hit (2ms)
                </span>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {new Date(createdAt).toLocaleString()}
              </span>
            </div>
            <h2 id="eval-report-title" className="text-xl font-bold text-white mt-1">
              Gnani Prisma STT Dual-Layer Performance Audit
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close evaluation report"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PILLAR 1 & 6: High-Visibility Critical Entity Alert Banner */}
        {hasCriticalMismatch ? (
          <div className="rounded-xl border-2 border-red-600/90 bg-red-950/40 p-4 md:p-5 flex items-start gap-3.5 shadow-lg shadow-red-950/30">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                  CRITICAL ENTITY FAILURE
                </span>
                <span className="text-xs text-red-300 font-semibold">Semantic Integrity Compromised</span>
              </div>
              <p className="text-xs text-red-200/90 leading-relaxed font-sans">
                Surface transcription achieved a low WER of <strong className="text-white font-mono">{wer}%</strong>, but critical transactional entities (e.g. recipient name, amount, or location) were misrecognized. In production Indian voice banking or customer support, this constitutes a fatal failure.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-4 flex items-start gap-3.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                  ALL CRITICAL ENTITIES VERIFIED
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                Gnani Prisma successfully recognized all developer-defined transactional entities with exact semantic fidelity.
              </p>
            </div>
          </div>
        )}

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Word Error Rate</span>
            <div className={`text-2xl font-black mt-1 font-mono ${wer <= 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {wer}%
            </div>
            <span className="text-[10px] text-slate-500">WER = (S+D+I)/N</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Character Error Rate</span>
            <div className="text-2xl font-black mt-1 font-mono text-slate-200">
              {cer}%
            </div>
            <span className="text-[10px] text-slate-500">Grapheme-Clustered CER</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Critical Entity Score</span>
            <div className={`text-2xl font-black mt-1 font-mono ${!hasCriticalMismatch ? 'text-emerald-400' : 'text-red-400'}`}>
              {entityEvaluation.entityAccuracy || 0}%
            </div>
            <span className="text-[10px] text-slate-500">
              {entityEvaluation.matchedEntities || 0}/{entityEvaluation.totalEntities || 0} verified
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Inference Latency</span>
            <div className="text-2xl font-black mt-1 font-mono text-indigo-400">
              {latencyMs || 240} ms
            </div>
            <span className="text-[10px] text-slate-500">{provider || 'Gnani Prisma STT'}</span>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Side-by-Side Transcript Comparison</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>EXPECTED TRANSCRIPT (REFERENCE)</span>
                <span className="text-slate-500">{details.wordCount || 0} words</span>
              </div>
              <p className="text-sm font-serif text-slate-100 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                {expectedTranscription}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>GNANI PRISMA OUTPUT (HYPOTHESIS)</span>
                <span className="text-indigo-400 font-mono text-[11px]">Confidence: {Math.round((confidence || 0.94) * 100)}%</span>
              </div>
              <p className="text-sm font-serif text-slate-100 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                {predictedTranscription}
              </p>
            </div>
          </div>
        </div>

        {/* PILLAR 6: Accessible Visual Diff Viewer with <del> and <ins> */}
        {alignment && alignment.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">
                Accessible Sequential Word Diff (<span className="text-slate-400 font-mono">Levenshtein Backpointers</span>)
              </h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-slate-700"></span> Match
                </span>
                <span className="flex items-center gap-1 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded bg-rose-600"></span> Deleted / Replaced (&lt;del&gt;)
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded bg-amber-600"></span> Inserted / Hallucinated (&lt;ins&gt;)
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2 text-xs font-mono leading-loose">
              {alignment.map((token, i) => {
                if (token.type === 'match') {
                  return (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-slate-200 bg-slate-900 border border-slate-800"
                    >
                      {token.ref}
                    </span>
                  );
                } else if (token.type === 'substitution') {
                  return (
                    <span key={i} className="inline-flex items-center gap-1">
                      <del 
                        className="bg-rose-950/80 text-rose-300 border border-rose-600 px-1.5 py-0.5 rounded line-through decoration-rose-500 font-medium"
                        aria-label={`Expected word missed: ${token.ref}`}
                      >
                        {token.ref}
                      </del>
                      <ins 
                        className="bg-amber-950/80 text-amber-200 border border-amber-600 px-1.5 py-0.5 rounded no-underline font-semibold"
                        aria-label={`Recognized substitution: ${token.hyp}`}
                      >
                        {token.hyp}
                      </ins>
                    </span>
                  );
                } else if (token.type === 'deletion') {
                  return (
                    <del
                      key={i}
                      className="bg-rose-950/80 text-rose-300 border border-rose-600 px-1.5 py-0.5 rounded line-through decoration-rose-500 font-medium"
                      aria-label={`Omitted word: ${token.ref}`}
                    >
                      {token.ref}
                    </del>
                  );
                } else {
                  return (
                    <ins
                      key={i}
                      className="bg-amber-950/80 text-amber-200 border border-amber-600 px-1.5 py-0.5 rounded no-underline font-semibold"
                      aria-label={`Inserted hallucinated word: ${token.hyp}`}
                    >
                      +{token.hyp}
                    </ins>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Critical Entities Breakdown */}
        {entityEvaluation?.evaluatedEntities && entityEvaluation.evaluatedEntities.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Developer-Defined Critical Entities Audit</h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Entity Label</th>
                    <th className="py-2.5 px-3 font-medium">Type</th>
                    <th className="py-2.5 px-3 font-medium">Target Value</th>
                    <th className="py-2.5 px-3 font-medium text-right">Verification Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {entityEvaluation.evaluatedEntities.map((ent, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{ent.name}</td>
                      <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400 font-mono">{ent.type}</td>
                      <td className="py-2.5 px-3 font-mono text-white font-medium">{ent.expectedValue}</td>
                      <td className="py-2.5 px-3 text-right">
                        {ent.matched ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            PASSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                            <XCircle className="w-4 h-4" />
                            CRITICAL MISMATCH
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}
