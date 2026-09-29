import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'p-6',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        glass-card rounded-2xl relative overflow-hidden transition-all duration-300
        ${hover ? 'glass-card-hover cursor-pointer' : ''}
        ${glow ? 'before:absolute before:inset-0 before:bg-radial-gradient before:pointer-events-none' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
