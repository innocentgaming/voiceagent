import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'default', 'primary', 'success', 'warning', 'danger', 'purple', 'neutral'
  size = 'md', // 'sm', 'md'
  icon: Icon,
  className = ''
}) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const variantClasses = {
    default: 'bg-[#f2f4f8] dark:bg-[#1a2234] text-[#697386] dark:text-[#94a3b8] border border-[#e6e9ef] dark:border-[#1e2638]',
    primary: 'bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] border border-[#3457d5]/20',
    success: 'bg-[#e8f5ef] dark:bg-[#062d1f] text-[#16865b] dark:text-[#34d399] border border-[#16865b]/20',
    warning: 'bg-[#fdf5ea] dark:bg-[#322008] text-[#d68a25] dark:text-[#fbbf24] border border-[#d68a25]/20',
    danger: 'bg-[#fdeeee] dark:bg-[#341111] text-[#d64545] dark:text-[#f87171] border border-[#d64545]/20',
    purple: 'bg-[#f3e8ff] dark:bg-[#2e1065] text-[#9333ea] dark:text-[#c084fc] border border-[#9333ea]/20',
    neutral: 'bg-transparent text-[#697386] dark:text-[#94a3b8] border border-[#e6e9ef] dark:border-[#1e2638]'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

