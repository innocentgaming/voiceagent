import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`saas-card ${hover ? 'saas-card-hover cursor-pointer' : ''} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
