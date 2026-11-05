import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none animate-fade-in">
      {toasts.map((toast) => {
        const type = toast.type || 'info'; // 'success' | 'warning' | 'error' | 'info'
        const icons = {
          success: CheckCircle2,
          warning: AlertTriangle,
          error: AlertTriangle,
          info: Info
        };
        const Icon = icons[type] || Info;

        const borderClasses = {
          success: 'border-[#16865b]/30 bg-[#e8f5ef] dark:bg-[#062d1f] text-[#16865b] dark:text-[#34d399]',
          warning: 'border-[#d68a25]/30 bg-[#fdf5ea] dark:bg-[#322008] text-[#d68a25] dark:text-[#fbbf24]',
          error: 'border-[#d64545]/30 bg-[#fdeeee] dark:bg-[#341111] text-[#d64545] dark:text-[#f87171]',
          info: 'border-[#3457d5]/30 bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5]'
        }[type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-[12px] border shadow-lg backdrop-blur-md transition-all duration-200 ${borderClasses}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 text-xs">
              {toast.title && <div className="font-bold">{toast.title}</div>}
              <div className="opacity-90 leading-relaxed text-[11px]">{toast.message}</div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
