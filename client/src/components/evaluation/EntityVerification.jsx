import React from 'react';
import Badge from '../common/Badge';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function EntityVerification({
  entities = [],
  criticalPassed = true
}) {
  return (
    <div className="space-y-4">
      {/* Alert Header if Critical Entity Mismatch Detected */}
      {!criticalPassed && (
        <div className="p-4 rounded-[12px] bg-[#fdeeee] dark:bg-[#341111]/40 border-2 border-[#d64545] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#d64545] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#d64545] font-mono">
              Critical Business Entity Failure Detected
            </h4>
            <p className="text-xs text-[#697386] dark:text-[#94a3b8] leading-relaxed">
              Even if general WER is acceptable, a high-stakes parameter (recipient name, amount, or transaction ID) failed verification. In production banking, this would result in catastrophic routing failure.
            </p>
          </div>
        </div>
      )}

      {/* Verification Audit Table */}
      <div className="overflow-x-auto rounded-[12px] border border-[#e6e9ef] dark:border-[#1e2638] bg-white dark:bg-[#111622]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f9fc] dark:bg-[#0d121c] border-b border-[#e6e9ef] dark:border-[#1e2638] text-[10px] uppercase font-mono font-bold text-[#697386] dark:text-[#94a3b8] tracking-wider">
            <tr>
              <th className="py-2.5 px-4">#</th>
              <th className="py-2.5 px-4">Entity Parameter</th>
              <th className="py-2.5 px-4">Expected Value</th>
              <th className="py-2.5 px-4">Detected in Hypothesis</th>
              <th className="py-2.5 px-4 text-right">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e9ef] dark:divide-[#1e2638] font-mono">
            {entities && entities.length > 0 ? (
              entities.map((item, idx) => {
                const passed = item.passed !== false && item.status !== 'CRITICAL_MISMATCH';
                const isNearMiss = item.status === 'NEAR_MISS';

                return (
                  <tr key={idx} className="hover:bg-[#f8f9fc] dark:hover:bg-[#171d2b] transition">
                    <td className="py-3 px-4 text-[#8c97a8]">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-[#151923] dark:text-[#f1f5f9]">
                      {item.entityType || item.type || 'Parameter'}
                    </td>
                    <td className="py-3 px-4 font-devanagari text-[#3457d5] dark:text-[#6a87f5] font-medium">
                      {item.expectedValue || item.expected || '--'}
                    </td>
                    <td className="py-3 px-4 font-devanagari text-[#151923] dark:text-[#f1f5f9]">
                      {item.detectedValue || item.recognized || (passed ? (item.expectedValue || item.expected) : 'Not found')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {passed ? (
                        <Badge variant="success" size="sm" icon={CheckCircle2}>
                          Pass
                        </Badge>
                      ) : isNearMiss ? (
                        <Badge variant="warning" size="sm" icon={AlertCircle}>
                          Near Miss
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm" icon={AlertTriangle}>
                          Critical Mismatch
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-[#8c97a8] italic font-sans">
                  No critical entities specified for this test case.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
