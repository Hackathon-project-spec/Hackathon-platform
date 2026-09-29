import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/25 focus:ring-primary-500 border border-primary-400/30',
    glow: 'bg-gradient-to-r from-primary-600 via-indigo-500 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan text-white shadow-glow-primary focus:ring-primary-400 font-semibold',
    secondary: 'bg-surface-elevated hover:bg-surface-highlight text-slate-200 border border-white/10 hover:border-white/20 focus:ring-slate-400',
    outline: 'bg-transparent hover:bg-white/5 text-slate-300 border border-white/15 hover:border-white/30 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 focus:ring-rose-500 border border-rose-400/30',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 focus:ring-emerald-500 border border-emerald-400/30',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
    </button>
  );
}
