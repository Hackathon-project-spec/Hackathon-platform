import React from 'react';
import { UserCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../common/Card';

export default function JudgeProgressCard({ progress = [] }) {
  return (
    <Card className="border border-white/10 shadow-xl p-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div>
          <h4 className="font-display font-bold text-base text-white">
            Evaluator Completion Dashboard
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of assigned vs completed reviews per judge
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {progress.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No assignments tracked yet.</p>
        ) : (
          progress.map((item) => {
            const isDone = item.percentComplete >= 100;
            return (
              <div
                key={item.judgeId}
                className="p-4 rounded-xl bg-surface-elevated/40 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary-600/30 text-primary-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      J
                    </div>
                    <span className="font-mono text-slate-200 font-medium">
                      Judge #{item.judgeId?.substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">
                      {item.completed} / {item.totalAssigned} done
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.percentComplete ? item.percentComplete.toFixed(0) : 0}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isDone
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-primary-500 to-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, item.percentComplete || 0))}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
