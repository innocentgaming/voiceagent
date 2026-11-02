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
    entityEvaluation = {}
  } = run;

  const hasCriticalMismatch = entityEvaluation?.hasCriticalMismatch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Evaluation Report
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {new Date(createdAt).toLocaleString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Gnani Prisma STT Performance Audit</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Critical Entity Alert Banner (Core PRD differentiator) */}
        {hasCriticalMismatch ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-300">
                CRITICAL ENTITY FAILURE DETECTED
              </h3>
              <p className="text-xs text-red-200/80 mt-1">
                Even though the overall phonetic transcript accuracy is <strong className="text-white">{accuracy}%</strong>, the voice model misrecognized or missed essential transactional entities (e.g., recipient name or transfer amount). In high-stakes Indian voice applications, this would cause a business transaction failure.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-300">
                ALL CRITICAL ENTITIES VERIFIED
              </h3>
              <p className="text-xs text-emerald-200/80 mt-1">
                Gnani Prisma successfully recognized all required critical entities with high semantic fidelity.
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
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
            <span className="text-[10px] text-slate-500">CER (Levenshtein)</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Entity Accuracy</span>
            <div className={`text-2xl font-black mt-1 font-mono ${entityEvaluation.entityAccuracy >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>
              {entityEvaluation.entityAccuracy || 0}%
            </div>
            <span className="text-[10px] text-slate-500">
              {entityEvaluation.matchedEntities || 0}/{entityEvaluation.totalEntities || 0} matched
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-medium">STT Confidence</span>
            <div className="text-2xl font-black mt-1 font-mono text-indigo-400">
              {Math.round((confidence || 0.95) * 100)}%
            </div>
            <span className="text-[10px] text-slate-500">{provider}</span>
          </div>
        </div>

        {/* Side-by-Side Transcription Comparison */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Side-by-Side Transcript Comparison</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Expected Reference */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>EXPECTED TRANSCRIPT (REFERENCE)</span>
                <span className="text-slate-500">{details.wordCount || 0} words</span>
              </div>
              <p className="text-sm font-serif text-slate-100 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                {expectedTranscription}
              </p>
            </div>

            {/* Predicted Hypothesis */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>GNANI PRISMA OUTPUT</span>
                <span className="text-indigo-400 font-mono text-[11px]">{provider}</span>
              </div>
              <p className="text-sm font-serif text-slate-100 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                {predictedTranscription}
              </p>
            </div>

          </div>
        </div>

        {/* Word-by-Word Alignment & Error Highlighting */}
        {alignment && alignment.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">Word-Level Error Alignment</h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500"></span>
                  Match ({details.matches || 0})
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500"></span>
                  Substitution ({details.substitutions || 0})
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500"></span>
                  Deletion ({details.deletions || 0})
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500/30 border border-sky-500"></span>
                  Insertion ({details.insertions || 0})
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap gap-2 text-xs font-mono">
              {alignment.map((token, i) => {
                if (token.type === 'match') {
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      title="Exact Match"
                    >
                      {token.ref}
                    </span>
                  );
                } else if (token.type === 'substitution') {
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-red-500/20 border border-red-500/50 text-red-300 flex items-center gap-1 font-bold shadow-sm"
                      title={`Substitution: expected "${token.ref}", got "${token.hyp}"`}
                    >
                      <span className="line-through text-red-400/70">{token.ref}</span>
                      <span className="text-red-400">→</span>
                      <span className="text-white underline">{token.hyp}</span>
                    </span>
                  );
                } else if (token.type === 'deletion') {
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 line-through"
                      title={`Deletion: omitted word "${token.ref}"`}
                    >
                      {token.ref}
                    </span>
                  );
                } else {
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-sky-500/20 border border-sky-500/50 text-sky-300"
                      title={`Insertion: extra word "${token.hyp}"`}
                    >
                      +{token.hyp}
                    </span>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Critical Entity Verification Table */}
        {entityEvaluation?.evaluatedEntities && entityEvaluation.evaluatedEntities.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Critical Entities Breakdown</h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Entity Name</th>
                    <th className="py-2.5 px-3 font-medium">Type</th>
                    <th className="py-2.5 px-3 font-medium">Target Value</th>
                    <th className="py-2.5 px-3 font-medium">Severity</th>
                    <th className="py-2.5 px-3 font-medium text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {entityEvaluation.evaluatedEntities.map((ent, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{ent.name}</td>
                      <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400 font-mono">{ent.type}</td>
                      <td className="py-2.5 px-3 font-mono text-white font-medium">{ent.expectedValue}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {ent.severity || 'CRITICAL'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {ent.matched ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            PASSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                            <XCircle className="w-4 h-4" />
                            FAILED
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
