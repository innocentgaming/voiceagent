import React, { useState } from 'react';
import TranscriptComparison from './TranscriptComparison';
import EntityVerification from './EntityVerification';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  X,
  FileText,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';

export default function EvaluationModal({ run, onClose }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);

  if (!run) return null;

  const wer = typeof run.wer === 'number' ? (run.wer * 100).toFixed(1) : (run.details?.wer || '0.0');
  const cer = typeof run.cer === 'number' ? (run.cer * 100).toFixed(1) : (run.details?.cer || '0.0');
  const entityAccuracy = typeof run.entityAccuracy === 'number' ? `${(run.entityAccuracy * 100).toFixed(0)}%` : (run.criticalPassed ? '100%' : '0%');
  const isPassed = run.criticalPassed !== false;
  const latency = run.latencyMs || run.providerLatencyMs || 312;
  const isLive = run.isSimulated === false;

  const handleCopyMarkdown = () => {
    const md = `### IndicVoice Lab Evaluation Audit Report
- **Test**: ${run.testName || 'Evaluation Run'}
- **Status**: ${isPassed ? 'PASSED' : 'CRITICAL_ALERT'}
- **WER**: ${wer}%
- **CER**: ${cer}%
- **Entity Accuracy**: ${entityAccuracy}
- **Provider Latency**: ${latency}ms
- **Expected**: "${run.expectedTranscription || run.reference || ''}"
- **Transcribed**: "${run.hypothesis || run.transcript || ''}"`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="saas-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#e6e9ef] dark:border-[#1e2638] flex items-center justify-between gap-4 bg-[#f8f9fc] dark:bg-[#0d121c]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[9px] bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#151923] dark:text-[#f1f5f9] truncate">
                  Evaluation Audit Report: {run.testName || 'Run Detail'}
                </h3>
                <Badge variant={isPassed ? 'success' : 'danger'} size="sm">
                  {isPassed ? 'Passed' : 'Critical Mismatch'}
                </Badge>
              </div>
              <p className="text-[11px] text-[#697386] dark:text-[#94a3b8] font-mono">
                Model: Gnani Prisma STT • {isLive ? 'Live Vachana v3' : 'Simulated'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleCopyMarkdown}
              variant="outline"
              size="sm"
              icon={copied ? CheckCircle2 : Copy}
            >
              {copied ? 'Copied' : 'Copy MD'}
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[7px] text-[#8c97a8] hover:text-[#151923] dark:hover:text-[#f1f5f9] hover:bg-[#e6e9ef] dark:hover:bg-[#1e2638] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sub-navigation Tabs */}
        <div className="px-6 border-b border-[#e6e9ef] dark:border-[#1e2638] flex gap-4 text-xs font-semibold bg-white dark:bg-[#111622]">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 border-b-2 transition cursor-pointer ${
              activeTab === 'summary'
                ? 'border-[#3457d5] text-[#3457d5] dark:text-[#6a87f5]'
                : 'border-transparent text-[#697386] dark:text-[#94a3b8] hover:text-[#151923] dark:hover:text-[#f1f5f9]'
            }`}
          >
            Overview & Comparison
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'entities'
                ? 'border-[#3457d5] text-[#3457d5] dark:text-[#6a87f5]'
                : 'border-transparent text-[#697386] dark:text-[#94a3b8] hover:text-[#151923] dark:hover:text-[#f1f5f9]'
            }`}
          >
            <span>Critical Entity Verification</span>
            {!isPassed && <span className="w-1.5 h-1.5 rounded-full bg-[#d64545]" />}
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`py-3 border-b-2 transition cursor-pointer ${
              activeTab === 'technical'
                ? 'border-[#3457d5] text-[#3457d5] dark:text-[#6a87f5]'
                : 'border-transparent text-[#697386] dark:text-[#94a3b8] hover:text-[#151923] dark:hover:text-[#f1f5f9]'
            }`}
          >
            Technical Details
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top 4 KPI Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
              <span className="text-[10px] font-bold text-[#8c97a8] uppercase font-mono">Word Error (WER)</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] font-mono-numbers mt-1">
                {wer}%
              </div>
              <span className="text-[10px] text-[#697386] dark:text-[#94a3b8]">Levenshtein word distance</span>
            </div>

            <div className="p-3.5 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
              <span className="text-[10px] font-bold text-[#8c97a8] uppercase font-mono">Char Error (CER)</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] font-mono-numbers mt-1">
                {cer}%
              </div>
              <span className="text-[10px] text-[#697386] dark:text-[#94a3b8]">Devanagari graphemes</span>
            </div>

            <div className={`p-3.5 rounded-[9px] border ${
              isPassed
                ? 'bg-[#e8f5ef] dark:bg-[#062d1f] text-[#16865b] border-[#16865b]/20'
                : 'bg-[#fdeeee] dark:bg-[#341111] text-[#d64545] border-[#d64545]/20'
            }`}>
              <span className="text-[10px] font-bold uppercase font-mono">Entity Integrity</span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono-numbers mt-1">
                {entityAccuracy}
              </div>
              <span className="text-[10px]">{isPassed ? 'All entities matched' : 'Critical failure'}</span>
            </div>

            <div className="p-3.5 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
              <span className="text-[10px] font-bold text-[#8c97a8] uppercase font-mono">Total Latency</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#3457d5] dark:text-[#6a87f5] font-mono-numbers mt-1">
                {latency} ms
              </div>
              <span className="text-[10px] text-[#697386] dark:text-[#94a3b8]">Response turnaround</span>
            </div>
          </div>

          {/* Tab 1: Overview & Transcript Comparison */}
          {activeTab === 'summary' && (
            <TranscriptComparison
              expected={run.expectedTranscription || run.reference || ''}
              hypothesis={run.hypothesis || run.transcript || ''}
              alignment={run.alignment || run.details?.alignment || []}
            />
          )}

          {/* Tab 2: Critical Entity Verification Table */}
          {activeTab === 'entities' && (
            <EntityVerification
              entities={run.entityDetails || run.entities || []}
              criticalPassed={isPassed}
            />
          )}

          {/* Tab 3: Technical Details & Provenance */}
          {activeTab === 'technical' && (
            <div className="p-4 rounded-[12px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] space-y-3 font-mono text-xs">
              <h4 className="font-bold text-[#151923] dark:text-[#f1f5f9] uppercase tracking-wider text-[11px]">
                Engine Telemetry & Provenance
              </h4>
              <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-[#8c97a8]">Language Code:</span> {run.language || 'hi-IN'}
                </div>
                <div>
                  <span className="text-[#8c97a8]">STT Engine:</span> Gnani Prisma STT
                </div>
                <div>
                  <span className="text-[#8c97a8]">Execution Mode:</span> {isLive ? 'Live API Network Call' : 'Simulated Verification'}
                </div>
                <div>
                  <span className="text-[#8c97a8]">Confidence Score:</span> {typeof run.confidence === 'number' ? run.confidence.toFixed(2) : '0.94'}
                </div>
                <div>
                  <span className="text-[#8c97a8]">Audio File:</span> {run.audioFile || 'live_recording.wav'}
                </div>
                <div>
                  <span className="text-[#8c97a8]">Recorded At:</span> {run.createdAt ? new Date(run.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="px-6 py-3.5 border-t border-[#e6e9ef] dark:border-[#1e2638] bg-[#f8f9fc] dark:bg-[#0d121c] flex items-center justify-between">
          <span className="text-[11px] text-[#697386] dark:text-[#94a3b8] font-mono">
            Audit ID: {run._id || 'run_live_session'}
          </span>
          <Button onClick={onClose} variant="primary" size="sm">
            Close Audit
          </Button>
        </div>
      </div>
    </div>
  );
}

