import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Play,
  RotateCw,
  FileText,
  Trash2,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Mic
} from 'lucide-react';

export default function TestCaseCard({
  test,
  onRunTest,
  onDeleteTest,
  onViewRunDetails,
  isRunning = false
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const lastRun = test.lastRun;
  const isPassed = lastRun?.criticalPassed;
  const hasRun = !!lastRun;

  // Language mapping badge variant
  const langVariant = {
    'hi-IN': 'primary',
    'mr-IN': 'purple',
    'hinglish': 'warning',
    'en-IN': 'default'
  }[test.language] || 'default';

  return (
    <Card hover className="flex flex-col justify-between space-y-4">
      {/* Top Header: Name, Language & Scenario */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-[#151923] dark:text-[#f1f5f9] truncate">
              {test.name}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge variant={langVariant} size="sm">
                {test.language || 'hi-IN'}
              </Badge>
              <Badge variant="neutral" size="sm">
                {test.category || 'General'}
              </Badge>
              {test.noiseLevel && test.noiseLevel !== 'clean' && (
                <Badge variant="warning" size="sm">
                  {test.noiseLevel}
                </Badge>
              )}
            </div>
          </div>

          {/* Delete Action */}
          <button
            onClick={() => onDeleteTest(test._id)}
            className="p-1.5 rounded-[7px] text-[#8c97a8] hover:text-[#d64545] hover:bg-[#fdeeee] dark:hover:bg-[#341111] transition cursor-pointer shrink-0"
            title="Delete test case"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Expected Transcription */}
        <div className="mt-3 p-2.5 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
          <div className="text-[10px] font-bold text-[#8c97a8] font-mono uppercase tracking-wider mb-1">
            Expected Reference (Ground Truth)
          </div>
          <p className="text-xs text-[#151923] dark:text-[#f1f5f9] font-medium leading-relaxed font-devanagari">
            {test.expectedTranscription}
          </p>
        </div>

        {/* Critical Business Entities Chips */}
        {test.criticalEntities && test.criticalEntities.length > 0 && (
          <div className="mt-2.5">
            <div className="text-[10px] font-bold text-[#8c97a8] font-mono uppercase tracking-wider mb-1">
              Critical Business Entities
            </div>
            <div className="flex flex-wrap gap-1">
              {test.criticalEntities.map((ent, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-mono bg-[#f2f4f8] dark:bg-[#1a2234] text-[#697386] dark:text-[#94a3b8] border border-[#e6e9ef] dark:border-[#1e2638]"
                >
                  <span className="font-semibold text-[#3457d5] dark:text-[#6a87f5]">{ent.entityType}:</span>
                  <span>{ent.expectedValue}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Middle: Last Run Results & Evaluation Status */}
      <div className="pt-3 border-t border-[#e6e9ef] dark:border-[#1e2638]">
        {hasRun ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-1.5 rounded-[7px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
                <div className="text-[10px] text-[#697386] dark:text-[#94a3b8]">WER</div>
                <div className="font-extrabold text-[#151923] dark:text-[#f1f5f9]">
                  {typeof lastRun.wer === 'number' ? `${(lastRun.wer * 100).toFixed(1)}%` : '--'}
                </div>
              </div>

              <div className="p-1.5 rounded-[7px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638]">
                <div className="text-[10px] text-[#697386] dark:text-[#94a3b8]">CER</div>
                <div className="font-extrabold text-[#151923] dark:text-[#f1f5f9]">
                  {typeof lastRun.cer === 'number' ? `${(lastRun.cer * 100).toFixed(1)}%` : '--'}
                </div>
              </div>

              <div className={`p-1.5 rounded-[7px] border font-bold ${
                isPassed
                  ? 'bg-[#e8f5ef] dark:bg-[#062d1f] text-[#16865b] border-[#16865b]/20'
                  : 'bg-[#fdeeee] dark:bg-[#341111] text-[#d64545] border-[#d64545]/20'
              }`}>
                <div className="text-[10px]">Entity Audit</div>
                <div>{isPassed ? '✓ Passed' : '✕ Alert'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-[#8c97a8] italic">
            Not evaluated yet. Click "Run Evaluation" to benchmark.
          </div>
        )}
      </div>

      {/* Bottom: Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-2">
        {/* Audio Player Action if audio file exists */}
        {test.audioFile ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="p-1.5 rounded-[7px] bg-[#f2f4f8] dark:bg-[#1a2234] hover:bg-[#ebf0ff] dark:hover:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] transition cursor-pointer text-xs flex items-center gap-1"
              title="Play uploaded audio sample"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="font-mono text-[10px] hidden sm:inline">Audio</span>
            </button>
            {isPlayingAudio && (
              <audio
                src={`/uploads/${test.audioFile}`}
                autoPlay
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            )}
          </div>
        ) : (
          <span className="text-[10px] text-[#8c97a8] font-mono">No audio</span>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {hasRun && (
            <Button
              onClick={() => onViewRunDetails(lastRun)}
              variant="outline"
              size="sm"
              icon={FileText}
            >
              Audit Report
            </Button>
          )}

          <Button
            onClick={() => onRunTest(test._id)}
            variant="primary"
            size="sm"
            loading={isRunning}
            icon={RotateCw}
          >
            {isRunning ? 'Running...' : 'Run STT'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

