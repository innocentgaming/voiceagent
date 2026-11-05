import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-[9px] transition-all duration-150 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5'
  };

  const variantClasses = {
    primary: 'bg-[#3457d5] hover:bg-[#2b47b3] text-white shadow-sm shadow-[#3457d5]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3457d5]',
    secondary: 'bg-[#ebf0ff] dark:bg-[#1a233b] hover:bg-[#dce5ff] dark:hover:bg-[#222d4b] text-[#3457d5] dark:text-[#6a87f5] border border-transparent',
    outline: 'bg-transparent border border-[#e6e9ef] dark:border-[#1e2638] hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] text-[#151923] dark:text-[#f1f5f9] shadow-sm',
    ghost: 'bg-transparent hover:bg-[#f2f4f8] dark:hover:bg-[#171d2b] text-[#697386] dark:text-[#94a3b8] hover:text-[#151923] dark:hover:text-[#f1f5f9]',
    danger: 'bg-[#d64545] hover:bg-[#b83838] text-white shadow-sm shadow-[#d64545]/20'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
}

