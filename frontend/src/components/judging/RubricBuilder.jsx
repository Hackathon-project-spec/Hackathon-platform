import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Scale, Shield, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { createRubric } from '../../api/judging';
import { useNotifications } from '../../context/NotificationContext';

export default function RubricBuilder({ eventId, onCreated }) {
  const { showToast } = useNotifications();
  const [name, setName] = useState('2026 Innovation & Technical Merit Rubric');
  const [criteria, setCriteria] = useState([
    { name: 'Technical Execution & Architecture', description: 'Code cleanliness, microservices structure, error resilience, and deployment viability', weight: 3.0, minScore: 0.0, maxScore: 10.0 },
    { name: 'Innovation & Problem Solving', description: 'Novel use of AI/technology, originality, and impact', weight: 2.5, minScore: 0.0, maxScore: 10.0 },
    { name: 'Design & User Experience', description: 'Visual polish, responsive behavior, accessibility, and intuitive user journeys', weight: 2.0, minScore: 0.0, maxScore: 10.0 },
    { name: 'Completeness & Demo Quality', description: 'Functional working demonstration with zero mock data for existing APIs', weight: 1.5, minScore: 0.0, maxScore: 10.0 },
  ]);
  const [saving, setSaving] = useState(false);

  const addCriterion = () => {
    setCriteria(prev => [
      ...prev,
      { name: '', description: '', weight: 1.0, minScore: 0.0, maxScore: 10.0 },
    ]);
  };

  const removeCriterion = (idx) => {
    if (criteria.length <= 1) {
      showToast('A rubric must contain at least one criterion', 'warning');
      return;
    }
    setCriteria(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCriterion = (idx, field, value) => {
    setCriteria(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Rubric name is required', 'warning');
      return;
    }

    const invalid = criteria.some(c => !c.name.trim() || c.weight <= 0);
    if (invalid) {
      showToast('Each criterion must have a valid title and positive weight', 'warning');
      return;
    }

    setSaving(true);
    try {
      const created = await createRubric({
        eventId,
        name: name.trim(),
        criteria: criteria.map(c => ({
          name: c.name.trim(),
          description: c.description?.trim() || '',
          weight: parseFloat(c.weight),
          minScore: parseFloat(c.minScore),
          maxScore: parseFloat(c.maxScore),
        })),
        activate: true,
      });
      showToast('Rubric created and activated successfully!', 'success');
      if (onCreated) onCreated(created);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary-400" />
            Configurable Scoring Rubric Builder
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Define weighted criteria. Relative weights are normalized automatically by the backend scoring engine.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rubric Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
            Rubric Title
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-medium"
            placeholder="e.g. Finals Judging Rubric"
            required
          />
        </div>

        {/* Criteria List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Criteria Breakdown ({criteria.length})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={addCriterion}
            >
              Add Criterion
            </Button>
          </div>

          {criteria.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface-elevated/40 border border-white/10 space-y-3 relative group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-[11px] text-slate-400 mb-1">Criterion Name</label>
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCriterion(idx, 'name', e.target.value)}
                    placeholder="e.g. Technical Execution"
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-semibold"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[11px] text-slate-400 mb-1">Relative Weight</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={c.weight}
                    onChange={(e) => updateCriterion(idx, 'weight', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-primary-300 text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description & Guidelines for Judges</label>
                <input
                  type="text"
                  value={c.description}
                  onChange={(e) => updateCriterion(idx, 'description', e.target.value)}
                  placeholder="What should judges evaluate?"
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>Score Range: {c.minScore} - {c.maxScore}</span>
                </div>
                {criteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriterion(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            icon={CheckCircle}
          >
            Save & Activate Rubric
          </Button>
        </div>
      </form>
    </Card>
  );
}
