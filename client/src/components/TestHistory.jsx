import React from 'react';
import { History, CheckCircle2, AlertTriangle, ArrowRight, Clock, Activity } from 'lucide-react';

export default function TestHistory({ runs, onViewRunDetails }) {
  if (!runs || runs.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
        <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-300">No test runs recorded yet</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Execute test cases from the Workspace or load sample benchmark datasets to build regression history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Run History & Regression Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical evaluation logs for Gnani Prisma STT across test suites.
        </p>
      </div>

      {/* Runs Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Expected vs Predicted</th>
                <th className="py-3 px-4 font-medium text-center">WER</th>
                <th className="py-3 px-4 font-medium text-center">CER</th>
                <th className="py-3 px-4 font-medium text-center">Critical Entity Status</th>
                <th className="py-3 px-4 font-medium text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {runs.map((run) => {
                const hasMismatch = run.entityEvaluation?.hasCriticalMismatch;
                return (
                  <tr key={run._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(run.createdAt).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-medium text-slate-200 line-clamp-1">
                        {run.expectedTranscription}
                      </div>
                      <div className="text-slate-400 line-clamp-1 text-[11px] font-mono mt-0.5">
                        → {run.predictedTranscription}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] ${
                        run.wer <= 15 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {run.wer}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {run.cer}%
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {hasMismatch ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          CRITICAL FAILURE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewRunDetails(run)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-medium text-xs transition"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
