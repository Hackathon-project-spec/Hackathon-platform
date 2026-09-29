import React, { useState } from 'react';
import { Check, Star, AlertCircle, Save, Info } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { submitScores } from '../../api/judging';
import { useNotifications } from '../../context/NotificationContext';

export default function ScoreMatrix({
  eventId,
  submissionId,
  rubric,
  onScored,
  initialScores = {},
  initialNotes = {},
}) {
  const { showToast } = useNotifications();
  const [scores, setScores] = useState(initialScores);
  const [notes, setNotes] = useState(initialNotes);
  const [submitting, setSubmitting] = useState(false);

  const criteria = rubric?.criteria || [];

  const handleScoreChange = (criterionId, val) => {
    setScores(prev => ({ ...prev, [criterionId]: parseFloat(val) }));
  };

  const handleNoteChange = (criterionId, val) => {
    setNotes(prev => ({ ...prev, [criterionId]: val }));
  };

  // Compute live weighted average
  let totalWeight = 0;
  let weightedSum = 0;
  criteria.forEach(c => {
    const val = scores[c.id];
    if (val !== undefined && !isNaN(val)) {
      weightedSum += val * c.weight;
      totalWeight += c.weight;
    }
  });
  const liveWeightedAverage = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all criteria scored
    const missing = criteria.filter(c => scores[c.id] === undefined || isNaN(scores[c.id]));
    if (missing.length > 0) {
      showToast(`Please provide scores for all criteria (${missing[0].name} is missing)`, 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await submitScores({
        eventId,
        submissionId,
        scores,
        notes,
      });
      showToast('Scores submitted successfully! Assigned status marked complete.', 'success');
      if (onScored) onScored();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!rubric || criteria.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400 bg-surface/50 rounded-2xl border border-white/5">
        No active rubric configured for this event. An organizer must create a rubric first.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Live Weighted Score Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary-950/60 to-indigo-950/60 border border-primary-500/30 shadow-lg shadow-primary-500/10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary-300 font-mono flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
            Live Weighted Score
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Weights normalized automatically across {criteria.length} criteria
          </div>
        </div>
        <div className="text-right">
          <span className="font-display font-black text-3xl text-white tracking-tight">
            {liveWeightedAverage}
          </span>
          <span className="text-xs text-slate-400 ml-1">/ 10.0</span>
        </div>
      </div>

      {/* Criteria Sliders */}
      <div className="space-y-5">
        {criteria.map((c) => {
          const currentVal = scores[c.id] !== undefined ? scores[c.id] : (c.minScore + c.maxScore) / 2;
          return (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-surface-elevated/40 border border-white/10 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-white text-base">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30">
                      Weight: {c.weight}x
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.description}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={c.minScore}
                      max={c.maxScore}
                      step="0.5"
                      value={currentVal}
                      onChange={(e) => handleScoreChange(c.id, e.target.value)}
                      className="w-16 glass-input text-center rounded-xl py-1 text-sm font-bold text-white font-mono"
                    />
                    <span className="text-xs text-slate-400">/ {c.maxScore}</span>
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="pt-2">
                <input
                  type="range"
                  min={c.minScore}
                  max={c.maxScore}
                  step="0.5"
                  value={currentVal}
                  onChange={(e) => handleScoreChange(c.id, e.target.value)}
                  className="w-full accent-primary-500 h-2 bg-surface rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>Min: {c.minScore}</span>
                  <span className="text-primary-400 font-semibold">{currentVal}</span>
                  <span>Max: {c.maxScore}</span>
                </div>
              </div>

              {/* Notes per criterion */}
              <div>
                <input
                  type="text"
                  placeholder="Optional notes or feedback for this criterion..."
                  value={notes[c.id] || ''}
                  onChange={(e) => handleNoteChange(c.id, e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="glow"
          size="lg"
          icon={Save}
          loading={submitting}
        >
          Submit Final Evaluation
        </Button>
      </div>
    </form>
  );
}
