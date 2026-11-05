import React from 'react';

export default function TranscriptComparison({
  expected = '',
  hypothesis = '',
  alignment = []
}) {
  return (
    <div className="space-y-4">
      {/* Side-by-side expected vs actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expected Ground Truth */}
        <div className="p-3.5 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#8c97a8] uppercase font-mono tracking-wider">
            <span>Expected Reference (Ground Truth)</span>
            <span>{expected.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <p className="text-xs sm:text-sm text-[#151923] dark:text-[#f1f5f9] leading-relaxed font-devanagari font-medium">
            {expected || 'None specified'}
          </p>
        </div>

        {/* Transcribed Output */}
        <div className="p-3.5 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#8c97a8] uppercase font-mono tracking-wider">
            <span>Transcribed Output (Hypothesis)</span>
            <span className="text-[#16865b] font-bold">STT Result</span>
          </div>
          <p className="text-xs sm:text-sm text-[#151923] dark:text-[#f1f5f9] leading-relaxed font-devanagari font-medium">
            {hypothesis || 'Awaiting transcription...'}
          </p>
        </div>
      </div>

      {/* Sequential Word Alignment Diff (Levenshtein Traceback) */}
      <div className="p-4 rounded-[12px] bg-white dark:bg-[#111622] border border-[#e6e9ef] dark:border-[#1e2638] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#151923] dark:text-[#f1f5f9] font-mono">
              Word-by-Word Alignment Diff (Levenshtein Traceback)
            </h4>
            <p className="text-[11px] text-[#697386] dark:text-[#94a3b8]">
              Highlights exact phonetic dropouts, substitutions, and extraneous insertions.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] font-mono font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16865b]" /> Match
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d64545]" /> Replaced
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d68a25]" /> Inserted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8c97a8]" /> Deleted
            </span>
          </div>
        </div>

        {/* Tokens Container */}
        <div className="p-3.5 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] min-h-[60px] flex flex-wrap items-center gap-1.5 font-devanagari">
          {alignment && alignment.length > 0 ? (
            alignment.map((token, i) => {
              const type = token.type; // 'match', 'substitution', 'insertion', 'deletion'
              const colorClasses = {
                match: 'bg-white dark:bg-[#111622] text-[#151923] dark:text-[#f1f5f9] border-[#e6e9ef] dark:border-[#1e2638]',
                substitution: 'bg-[#fdeeee] dark:bg-[#341111] text-[#d64545] border-[#d64545]/40 font-bold',
                insertion: 'bg-[#fdf5ea] dark:bg-[#322008] text-[#d68a25] border-[#d68a25]/40 font-bold',
                deletion: 'bg-[#f2f4f8] dark:bg-[#1a2234] text-[#8c97a8] line-through border-[#e6e9ef] dark:border-[#1e2638]'
              }[type] || 'bg-white text-slate-800';

              return (
                <span
                  key={i}
                  className={`inline-flex items-center px-2 py-1 rounded-[6px] text-xs border font-mono ${colorClasses}`}
                >
                  {token.word || token.value || token.ref}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-[#8c97a8] font-sans italic">
              Alignment diff preview available when evaluation run includes token traceback.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

