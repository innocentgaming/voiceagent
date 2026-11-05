import React from 'react';
import Card from '../common/Card';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'good', 'bad', 'neutral'
  variant = 'default' // 'default', 'danger', 'success', 'primary'
}) {
  const iconBgClasses = {
    default: 'bg-[#f2f4f8] dark:bg-[#1a2234] text-[#697386] dark:text-[#94a3b8]',
    primary: 'bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5]',
    success: 'bg-[#e8f5ef] dark:bg-[#062d1f] text-[#16865b] dark:text-[#34d399]',
    danger: 'bg-[#fdeeee] dark:bg-[#341111] text-[#d64545] dark:text-[#f87171]'
  };

  const trendClasses = {
    good: 'text-[#16865b] dark:text-[#34d399]',
    bad: 'text-[#d64545] dark:text-[#f87171]',
    neutral: 'text-[#697386] dark:text-[#94a3b8]'
  };

  return (
    <Card hover className="flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#697386] dark:text-[#94a3b8] uppercase tracking-wider font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 ${iconBgClasses[variant]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight font-mono-numbers">
          {value}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 pt-2 border-t border-[#e6e9ef] dark:border-[#1e2638] flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-[#697386] dark:text-[#94a3b8] truncate">
              {subtitle}
            </span>
          )}
          {trend && (
            <span className={`font-mono font-bold shrink-0 ${trendClasses[trendType]}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

