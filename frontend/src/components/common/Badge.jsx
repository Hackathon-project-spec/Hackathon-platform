import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const variantStyles = {
    default: 'bg-surface-elevated text-slate-300 border-white/10',
    primary: 'bg-primary-500/10 text-primary-400 border-primary-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    // Status mappings
    LIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    SUBMITTED: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    DRAFT: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    JUDGING: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    COMPLETED: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    // Role mappings
    PARTICIPANT: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    JUDGE: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    ORGANIZER: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    ADMIN: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-primary-400',
    success: 'bg-emerald-400 animate-pulse',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    LIVE: 'bg-emerald-400 animate-pulse',
    SUBMITTED: 'bg-cyan-400',
    DRAFT: 'bg-amber-400',
    JUDGING: 'bg-purple-400 animate-pulse',
    COMPLETED: 'bg-slate-400',
  };

  const style = variantStyles[variant] || variantStyles.default;
  const dotColor = dotColors[variant] || dotColors.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
}
