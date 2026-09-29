import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`glass-card rounded-2xl p-10 sm:p-14 text-center flex flex-col items-center justify-center border border-dashed border-white/15 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-4 shadow-lg shadow-primary-500/10">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-display font-semibold text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
