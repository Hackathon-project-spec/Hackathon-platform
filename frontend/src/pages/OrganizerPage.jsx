import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Users,
  Shield,
  Scale,
  Zap,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import RubricBuilder from '../components/judging/RubricBuilder';
import JudgeProgressCard from '../components/judging/JudgeProgressCard';
import Modal from '../components/common/Modal';
import { getJudgingDashboard, getRankings, assignBatch, getRubrics } from '../api/judging';
import { listAllUsers } from '../api/auth';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Skeleton } from '../components/common/Skeleton';

export default function OrganizerPage() {
  const { currentEvent } = useEvent();
  const { isOrganizer, isJudge } = useAuth();
  const { showToast } = useNotifications();

  const [dashboard, setDashboard] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState([]);
  const [reviewsPerSubmission, setReviewsPerSubmission] = useState(2);
  const [assigning, setAssigning] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const eventId = currentEvent?.id;
      const [dash, ranks, rubs] = await Promise.all([
        getJudgingDashboard(eventId).catch(() => []),
        getRankings(eventId).catch(() => []),
        getRubrics(eventId).catch(() => []),
      ]);

      setDashboard(dash || []);
      setRankings(ranks || []);
      setRubrics(rubs || []);

      // Load judges list for assignment - ADMIN/ORGANIZER only endpoint
      try {
        const allUsers = await listAllUsers();
        const judgeList = (allUsers || []).filter(u => u.primaryRole === 'JUDGE');
        setJudges(judgeList);
        // Pre-select all judges
        setSelectedJudgeIds(judgeList.map(j => j.id));
      } catch {
        // Fallback to demo judge IDs
        const fallbackJudges = [
          { id: '00000000-0000-0000-0000-000000000003', firstName: 'Jan', lastName: 'Judge', primaryRole: 'JUDGE' },
          { id: '00000000-0000-0000-0000-000000000004', firstName: 'Jamie', lastName: 'Judge', primaryRole: 'JUDGE' },
        ];
        setJudges(fallbackJudges);
        setSelectedJudgeIds(fallbackJudges.map(j => j.id));
      }
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignBatch = async () => {
    if (selectedJudgeIds.length === 0) {
      showToast('Please select at least one judge for assignment', 'warning');
      return;
    }

    setAssigning(true);
    try {
      const result = await assignBatch({
        eventId: currentEvent?.id,
        judgeIds: selectedJudgeIds,
        reviewsPerSubmission,
      });
      showToast(`Batch assignment complete: ${result.length} assignments created using greedy load-balancing algorithm.`, 'success');
      setAssignModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const toggleJudge = (judgeId) => {
    setSelectedJudgeIds(prev =>
      prev.includes(judgeId)
        ? prev.filter(id => id !== judgeId)
        : [...prev, judgeId]
    );
  };

  if (!isOrganizer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Shield}
          title="Organizer or Admin Access Required"
          description="This panel is restricted to ORGANIZER and ADMIN roles. Switch identity using the demo bar above (e.g. Ola Organizer or Alex Admin)."
        />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Progress Dashboard', icon: BarChart2 },
    { id: 'rubric', label: 'Rubric Builder', icon: Scale },
    { id: 'assign', label: 'Judge Assignment', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="primary" size="md">ORGANIZER PANEL</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-2">
            Event Management &amp; Judging Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Configure rubrics, run algorithmic judge assignments, and monitor evaluation progress for{' '}
            <strong className="text-white">{currentEvent?.name}</strong>.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          icon={Users}
          onClick={() => setAssignModalOpen(true)}
        >
          Run Batch Assignment
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-surface-elevated/60 p-1 rounded-2xl border border-white/10 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Assignments',
                    value: dashboard.reduce((s, d) => s + d.totalAssigned, 0),
                    color: 'text-primary-400',
                  },
                  {
                    label: 'Completed Reviews',
                    value: dashboard.reduce((s, d) => s + d.completed, 0),
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Active Judges',
                    value: dashboard.length,
                    color: 'text-amber-400',
                  },
                  {
                    label: 'Ranked Projects',
                    value: rankings.length,
                    color: 'text-cyan-400',
                  },
                ].map((stat, i) => (
                  <Card key={i} className="border border-white/10 text-center">
                    <p className={`text-3xl font-display font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </Card>
                ))}
              </div>

              <JudgeProgressCard progress={dashboard} />

              {/* Active Rubrics Summary */}
              {rubrics.length > 0 && (
                <Card className="border border-white/10">
                  <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary-400" />
                    Active Scoring Rubric
                  </h3>
                  {rubrics.filter(r => r.active).map(r => (
                    <div key={r.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{r.name}</span>
                        <Badge variant="success" dot size="sm">Active</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(r.criteria || []).map(c => (
                          <div key={c.id} className="p-2.5 rounded-xl bg-surface-elevated/40 border border-white/5 text-xs">
                            <div className="font-semibold text-white truncate">{c.name}</div>
                            <div className="text-slate-400 mt-0.5">
                              Weight: <span className="text-primary-400 font-mono">{c.weight}x</span>
                            </div>
                            <div className="text-slate-500">Range: {c.minScore}–{c.maxScore}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}

          {activeTab === 'rubric' && (
            <RubricBuilder
              eventId={currentEvent?.id}
              onCreated={(rubric) => {
                setRubrics(prev => [...prev.filter(r => !r.active), rubric]);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'assign' && (
            <Card className="border border-white/10 space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  Greedy Load-Balancing Assignment
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  The algorithm shuffles all finalized submissions (deterministically seeded by event ID for reproducibility), then for each submission selects the N currently least-loaded judges who haven't already been assigned to it. Re-running tops up existing assignments rather than restarting.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 font-mono">
                    Select Judges to Include
                  </label>
                  <div className="space-y-2">
                    {judges.map(j => (
                      <div
                        key={j.id}
                        onClick={() => toggleJudge(j.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          selectedJudgeIds.includes(j.id)
                            ? 'bg-primary-600/15 border-primary-500/40'
                            : 'bg-surface-elevated/30 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            selectedJudgeIds.includes(j.id)
                              ? 'bg-primary-600 border-primary-400'
                              : 'border-white/30'
                          }`}>
                            {selectedJudgeIds.includes(j.id) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {j.firstName} {j.lastName}
                          </span>
                        </div>
                        <Badge variant="warning" size="sm">JUDGE</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Reviews Per Submission
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => setReviewsPerSubmission(n)}
                        className={`w-12 h-10 rounded-xl font-mono font-bold text-sm transition-all border ${
                          reviewsPerSubmission === n
                            ? 'bg-primary-600 border-primary-400 text-white'
                            : 'bg-surface-elevated border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="text-xs text-slate-400">
                      judges assigned per project
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="glow"
                    size="md"
                    icon={Zap}
                    loading={assigning}
                    onClick={handleAssignBatch}
                    disabled={selectedJudgeIds.length === 0}
                  >
                    Execute Assignment Algorithm
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Batch Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Algorithmic Judge Assignment"
        subtitle="Greedy load-balancing across selected evaluators"
        maxWidth="max-w-xl"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
            This will run the greedy assignment algorithm: shuffle finalized submissions, then for each assign the {reviewsPerSubmission} least-loaded eligible judge(s). Existing assignments are preserved; only missing assignments are added.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono">Judges</label>
            {judges.map(j => (
              <div
                key={j.id}
                onClick={() => toggleJudge(j.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedJudgeIds.includes(j.id)
                    ? 'bg-primary-600/15 border-primary-500/40'
                    : 'bg-white/5 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2.5 text-sm text-white">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedJudgeIds.includes(j.id) ? 'bg-primary-600 border-primary-400' : 'border-white/30'
                  }`}>
                    {selectedJudgeIds.includes(j.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  {j.firstName} {j.lastName}
                </div>
                <span className="text-[10px] font-mono text-amber-400">JUDGE</span>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono block mb-2">
              Reviews Per Submission: {reviewsPerSubmission}
            </label>
            <input
              type="range"
              min={1}
              max={Math.max(judges.length, 1)}
              value={reviewsPerSubmission}
              onChange={(e) => setReviewsPerSubmission(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={assigning} icon={Zap} onClick={handleAssignBatch}>
              Run Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
