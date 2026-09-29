import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import RankingsTable from '../components/judging/RankingsTable';
import { getRankings, getJudgingDashboard } from '../api/judging';
import { getGallery, SEEDED_GALLERY_PROJECTS } from '../api/submissions';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/common/Skeleton';

export default function LeaderboardPage() {
  const { currentEvent } = useEvent();
  const { isOrganizer } = useAuth();

  const [rankings, setRankings] = useState([]);
  const [progress, setProgress] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const eventId = currentEvent?.id;
      const [ranks, gallery, prog] = await Promise.all([
        getRankings(eventId).catch(() => []),
        getGallery({ eventId }).catch(() => SEEDED_GALLERY_PROJECTS),
        isOrganizer ? getJudgingDashboard(eventId).catch(() => []) : Promise.resolve([]),
      ]);

      setRankings(ranks || []);
      setProgress(prog || []);

      const map = {};
      (gallery || []).forEach(p => { map[p.id] = p; });
      // Ensure seeded projects are in the map
      SEEDED_GALLERY_PROJECTS.forEach(p => { if (!map[p.id]) map[p.id] = p; });
      setProjectsMap(map);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentEvent?.id, isOrganizer]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Chart data derived from rankings
  const chartData = rankings.slice(0, 8).map((r, i) => ({
    name: projectsMap[r.submissionId]?.title?.substring(0, 18) + '...' || `#${r.rank}`,
    raw: parseFloat(r.rawWeightedAverage?.toFixed(2) || 0),
    normalized: parseFloat((r.normalizedScore * 2 + 5).toFixed(2)), // scale z-score to 0-10 range for viz
    rank: r.rank,
  }));

  const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="purple" size="md">FINAL RANKINGS</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-2">
            Live Hackathon Leaderboard
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Real-time judge-normalized rankings for{' '}
            <strong className="text-white">{currentEvent?.name}</strong>.
            Scores use per-judge z-score standardization to eliminate evaluator bias.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-400' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Rankings'}
        </button>
      </div>

      {/* Podium Top 3 */}
      {!loading && rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-300/15 border border-slate-300/30 flex items-center justify-center text-2xl mb-2 shadow-lg">
              🥈
            </div>
            <div className="glass-card rounded-2xl p-3 sm:p-4 w-full border border-slate-300/20 bg-slate-800/30 mt-4" style={{ paddingTop: '1.5rem' }}>
              <p className="text-xs text-slate-400 truncate">
                {projectsMap[rankings[1]?.submissionId]?.title || `#2`}
              </p>
              <p className="font-display font-black text-xl text-white mt-1">
                {rankings[1]?.rawWeightedAverage?.toFixed(2)}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">raw avg</p>
            </div>
          </motion.div>

          {/* 1st Place - elevated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center text-center -mt-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400/50 flex items-center justify-center text-3xl mb-2 shadow-xl shadow-amber-400/20">
              🏆
            </div>
            <div className="glass-card rounded-2xl p-3 sm:p-5 w-full border border-amber-500/40 bg-amber-950/20 shadow-xl shadow-amber-500/10">
              <Badge variant="warning" dot size="sm" className="mb-2">WINNER</Badge>
              <p className="text-xs text-slate-300 truncate font-medium">
                {projectsMap[rankings[0]?.submissionId]?.title || '#1'}
              </p>
              <p className="font-display font-black text-2xl text-white mt-1">
                {rankings[0]?.rawWeightedAverage?.toFixed(2)}
              </p>
              <p className="text-[10px] font-mono text-amber-400 mt-0.5">
                z: {rankings[0]?.normalizedScore > 0 ? '+' : ''}{rankings[0]?.normalizedScore?.toFixed(2)}σ
              </p>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-2xl mb-2 shadow-lg">
              🥉
            </div>
            <div className="glass-card rounded-2xl p-3 sm:p-4 w-full border border-amber-700/20 bg-amber-950/10 mt-4" style={{ paddingTop: '1.5rem' }}>
              <p className="text-xs text-slate-400 truncate">
                {projectsMap[rankings[2]?.submissionId]?.title || '#3'}
              </p>
              <p className="font-display font-black text-xl text-white mt-1">
                {rankings[2]?.rawWeightedAverage?.toFixed(2)}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">raw avg</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Score Comparison Chart */}
      {!loading && chartData.length > 0 && (
        <Card className="border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-primary-400" />
            <h3 className="font-display font-bold text-lg text-white">Raw Weighted Score Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#0F172A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
              />
              <Bar dataKey="raw" name="Raw Weighted Average" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Full Rankings Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <RankingsTable
          eventId={currentEvent?.id}
          rankings={rankings}
          projectsMap={projectsMap}
        />
      )}
    </div>
  );
}
