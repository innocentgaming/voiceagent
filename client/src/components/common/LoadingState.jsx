import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({
  message = 'Loading platform analytics...',
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <Loader2 className="w-8 h-8 text-[#3457d5] animate-spin mb-3" />
      <p className="text-xs font-semibold text-[#697386] dark:text-[#94a3b8] font-mono tracking-wide">
        {message}
      </p>
    </div>
  );
}

