import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-white/5 rounded-xl border border-white/5 ${className}`}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col gap-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-auto">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-5 w-full rounded-lg" />
        </td>
      ))}
    </tr>
  );
}
