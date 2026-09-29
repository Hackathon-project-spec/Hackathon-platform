import React, { useState } from 'react';
import {
  Trophy,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { downloadExportCsv } from '../../api/judging';
import { formatZScore, getZScoreTone } from '../../utils/formatters';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function RankingsTable({ eventId, rankings = [], projectsMap = {} }) {
  const { showToast } = useNotifications();
  const { isOrganizer } = useAuth();
  const [downloading, setDownloading] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      await downloadExportCsv(eventId, type);
      showToast(`Exported ${type}.csv successfully`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDownloading(null);
    }
  };

  const getMedalBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold font-mono">
          <Trophy className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          #1 Gold
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-300/15 text-slate-200 border border-slate-300/30 text-xs font-bold font-mono">
          <Award className="w-3.5 h-3.5 text-slate-300" />
          #2 Silver
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-700/20 text-amber-500 border border-amber-600/30 text-xs font-bold font-mono">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          #3 Bronze
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-xl bg-white/5 text-slate-400 border border-white/5 text-xs font-bold font-mono">
        #{rank}
      </span>
    );
  };

  return (
    <Card className="border border-white/10 shadow-2xl overflow-hidden p-0">
      {/* Table Header with CSV Export Actions */}
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white tracking-tight">
                Normalized Judging Leaderboard
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardized via Per-Judge Z-Score Normalization to remove evaluator harshness & variance
              </p>
            </div>
          </div>
        </div>

        {/* CSV Export Triggers (T2 Feature) */}
        {isOrganizer && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">CSV Exports:</span>
            <Button
              variant="outline"
              size="sm"
              icon={FileSpreadsheet}
              loading={downloading === 'rankings'}
              onClick={() => handleDownload('rankings')}
            >
              Rankings
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileSpreadsheet}
              loading={downloading === 'scores'}
              onClick={() => handleDownload('scores')}
            >
              Raw Scores
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileSpreadsheet}
              loading={downloading === 'assignments'}
              onClick={() => handleDownload('assignments')}
            >
              Assignments
            </Button>
          </div>
        )}
      </div>

      {/* Z-score methodology explanation disclosure */}
      <div className="border-b border-white/5 bg-indigo-950/20 px-6 py-3">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center justify-between w-full text-xs text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Why Z-Score Normalization beats a simple raw average?</span>
          </span>
          {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExplanation && (
          <div className="mt-3 text-xs text-slate-300 space-y-2 pb-2 leading-relaxed">
            <p>
              Different judges possess systematic bias: some are naturally severe (giving 6/10 to everyone), while others are lenient (giving 9/10). A raw average penalizes teams that randomly draw a strict judge.
            </p>
            <p>
              <strong>The Raptors Algorithm:</strong> For each judge, the platform computes their personal mean (μ) and standard deviation (σ). Each evaluation is transformed into a standard score: <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-emerald-300">z = (score - μ) / σ</code>.
              A score of <code className="text-emerald-300 font-mono">+1.0σ</code> indicates that this judge rated the project 1 whole standard deviation above their own personal average.
            </p>
          </div>
        )}
      </div>

      {/* Rankings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider">
              <th className="py-4 px-6">Rank</th>
              <th className="py-4 px-6">Project Submission</th>
              <th className="py-4 px-6 text-center">Judges</th>
              <th className="py-4 px-6 text-center">Raw Avg</th>
              <th className="py-4 px-6 text-right">Normalized Z-Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rankings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                  No submissions have been evaluated yet. Judges need to submit scores.
                </td>
              </tr>
            ) : (
              rankings.map((r) => {
                const project = projectsMap[r.submissionId] || {
                  id: r.submissionId,
                  title: `Submission #${r.submissionId.substring(0, 8)}`,
                  tagline: 'Finalized hackathon project',
                };
                const tone = getZScoreTone(r.normalizedScore);

                return (
                  <tr
                    key={r.submissionId}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getMedalBadge(r.rank)}
                    </td>

                    {/* Project */}
                    <td className="py-4 px-6">
                      <div className="font-display font-bold text-white text-base group-hover:text-primary-300 transition-colors">
                        {project.title}
                      </div>
                      {project.tagline && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {project.tagline}
                        </p>
                      )}
                    </td>

                    {/* Judges Count */}
                    <td className="py-4 px-6 text-center font-mono text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">
                        {r.judgesScored} {r.judgesScored === 1 ? 'judge' : 'judges'}
                      </span>
                    </td>

                    {/* Raw Weighted Average */}
                    <td className="py-4 px-6 text-center font-mono text-sm text-slate-300">
                      <span className="font-semibold text-white">
                        {r.rawWeightedAverage ? r.rawWeightedAverage.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-xs text-slate-500"> / 10</span>
                    </td>

                    {/* Normalized Z-Score */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex flex-col items-end">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${tone.color}`}>
                          {formatZScore(r.normalizedScore)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {tone.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
