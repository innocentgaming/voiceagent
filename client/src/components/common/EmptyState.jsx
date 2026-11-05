import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 saas-card ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-[#151923] dark:text-[#f1f5f9] mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8] max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

