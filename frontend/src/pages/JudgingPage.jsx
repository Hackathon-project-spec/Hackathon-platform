import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Award,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ScoreMatrix from '../components/judging/ScoreMatrix';
import EmptyState from '../components/common/EmptyState';
import { getMyAssignments, getActiveRubric } from '../api/judging';
import { getGallery } from '../api/submissions';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function JudgingPage() {
  const { currentEvent } = useEvent();
  const { isJudge, user } = useAuth();
  const { showToast } = useNotifications();

  const [assignments, setAssignments] = useState([]);
  const [rubric, setRubric] = useState(null);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Active scoring modal
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [scoringModalOpen, setScoringModalOpen] = useState(false);

  const loadJudgingData = useCallback(async () => {
    setLoading(true);
    try {
      const [asgns, activeRub, gallery] = await Promise.all([
        getMyAssignments(currentEvent?.id).catch(() => []),
        getActiveRubric(currentEvent?.id).catch(() => null),
        getGallery({ eventId: currentEvent?.id }).catch(() => []),
      ]);

      setAssignments(asgns || []);
      setRubric(activeRub);

      const map = {};
      (gallery || []).forEach(p => {
        map[p.id] = p;
      });
      setProjectsMap(map);
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id]);

  useEffect(() => {
    loadJudgingData();
  }, [loadJudgingData]);

  const handleOpenScore = (asgn) => {
    setActiveAssignment(asgn);
    setScoringModalOpen(true);
  };

  const handleScoreSubmitted = () => {
    setScoringModalOpen(false);
    loadJudgingData();
  };

  if (!isJudge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={AlertTriangle}
          title="Judge Access Required"
          description="You are currently not logged in as an evaluator. Switch your demo role to Jan Judge or Jamie Judge using the demo bar above to test scoring."
        />
      </div>
    );
  }

  const completedCount = assignments.filter(a => a.complete).length;
  const progressPercent = assignments.length > 0 ? (completedCount / assignments.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="purple" size="md">EVALUATOR WORKSPACE</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-2">
            Judge Evaluation Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Evaluate projects assigned to you by the greedy load-balancing algorithm. Submissions are judged against the active weighted rubric.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="bg-surface-elevated/80 border border-white/10 rounded-2xl p-4 min-w-[220px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-mono">Your Queue Progress</span>
            <span className="font-bold text-white font-mono">
              {completedCount} / {assignments.length} ({progressPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Rubric Info Card */}
      {rubric && (
        <Card className="border border-white/10 bg-surface/50 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-mono font-semibold">Active Scoring Rubric</div>
                <div className="font-display font-bold text-lg text-white">{rubric.name}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(rubric.criteria || []).map((c) => (
                <span
                  key={c.id}
                  className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                >
                  {c.name} <strong className="text-primary-300">({c.weight}x)</strong>
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Assigned Projects List */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400" />
          Assigned Projects ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No projects currently assigned to you"
            description="The organizer needs to execute the batch assignment algorithm to distribute finalized projects among judges."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((asgn) => {
              const project = projectsMap[asgn.submissionId] || {
                id: asgn.submissionId,
                title: `Submission #${asgn.submissionId?.substring(0, 8)}`,
                tagline: 'Finalized hackathon submission',
                techStack: 'React, Node, Python',
              };

              return (
                <Card
                  key={asgn.id}
                  hover
                  className={`flex flex-col justify-between border ${
                    asgn.complete ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-white/10'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={asgn.complete ? 'success' : 'warning'} dot size="sm">
                        {asgn.complete ? 'Scored & Completed' : 'Pending Evaluation'}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-500">
                        {asgn.id?.substring(0, 10)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg text-white line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {project.tagline || project.description}
                      </p>
                    </div>

                    {project.techStack && (
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.split(',').slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400"
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-4">
                    {project.demoUrl ? (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">Direct Inspect</span>
                    )}

                    <Button
                      variant={asgn.complete ? 'outline' : 'glow'}
                      size="sm"
                      onClick={() => handleOpenScore(asgn)}
                    >
                      {asgn.complete ? 'Revise Score' : 'Evaluate Project'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Scoring Modal with ScoreMatrix */}
      <Modal
        isOpen={scoringModalOpen}
        onClose={() => setScoringModalOpen(false)}
        title={`Score: ${projectsMap[activeAssignment?.submissionId]?.title || 'Submission'}`}
        subtitle={`Evaluator: ${user?.firstName} ${user?.lastName} (JUDGE)`}
        maxWidth="max-w-2xl"
      >
        {activeAssignment && (
          <ScoreMatrix
            eventId={currentEvent?.id}
            submissionId={activeAssignment.submissionId}
            rubric={rubric}
            onScored={handleScoreSubmitted}
          />
        )}
      </Modal>
    </div>
  );
}
