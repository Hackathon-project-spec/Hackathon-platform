import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Save,
  CheckCircle2,
  FileCode,
  Github,
  Video,
  Image,
  Globe,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { getMyTeams } from '../api/teams';
import { createDraft, getSubmissionByTeam, updateSubmission, finalizeSubmission } from '../api/submissions';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function ProjectSubmitPage() {
  const navigate = useNavigate();
  const { currentEvent, tracks } = useEvent();
  const { isParticipant, user } = useAuth();
  const { showToast } = useNotifications();

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    trackId: '',
    repoUrl: '',
    demoUrl: '',
    videoUrl: '',
    coverImageUrl: '',
    techStack: '',
  });

  const loadTeamsAndSubmission = useCallback(async () => {
    setLoading(true);
    try {
      const myTeams = await getMyTeams();
      setTeams(myTeams || []);

      if (myTeams && myTeams.length > 0) {
        const teamId = myTeams[0].id;
        setSelectedTeamId(teamId);
        await checkExistingSubmission(teamId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id]);

  useEffect(() => {
    loadTeamsAndSubmission();
  }, [loadTeamsAndSubmission]);

  const checkExistingSubmission = async (teamId) => {
    if (!currentEvent?.id || !teamId) return;
    try {
      const existing = await getSubmissionByTeam(currentEvent.id, teamId);
      if (existing) {
        setSubmission(existing);
        setFormData({
          title: existing.title || '',
          tagline: existing.tagline || '',
          description: existing.description || '',
          trackId: existing.trackId || (tracks[0]?.id || ''),
          repoUrl: existing.repoUrl || '',
          demoUrl: existing.demoUrl || '',
          videoUrl: existing.videoUrl || '',
          coverImageUrl: existing.coverImageUrl || '',
          techStack: existing.techStack || '',
        });
      } else {
        setSubmission(null);
      }
    } catch {
      setSubmission(null);
    }
  };

  const handleTeamChange = async (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    await checkExistingSubmission(teamId);
  };

  const handleStartDraft = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter a project title', 'warning');
      return;
    }

    setSaving(true);
    try {
      const draft = await createDraft({
        eventId: currentEvent.id,
        teamId: selectedTeamId,
        title: formData.title.trim(),
      });
      setSubmission(draft);
      showToast('Project draft initialized! You can now flesh out links and details.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!submission?.id) return;
    setSaving(true);
    try {
      const updated = await updateSubmission(submission.id, formData);
      setSubmission(updated);
      showToast('Draft changes saved successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!submission?.id) return;
    if (!formData.description.trim()) {
      showToast('Please provide a description before finalizing', 'warning');
      return;
    }

    setFinalizing(true);
    try {
      // Save latest edits first
      await updateSubmission(submission.id, formData);
      // Finalize
      const finalized = await finalizeSubmission(submission.id);
      setSubmission(finalized);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('Project finalized! Your submission is now LIVE in the public gallery.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFinalizing(false);
    }
  };

  if (!isParticipant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={AlertTriangle}
          title="Participant Role Required"
          description="Only registered PARTICIPANT accounts can submit projects. Please switch identity using the demo bar above (e.g. Pat Participant)."
        />
      </div>
    );
  }

  if (teams.length === 0 && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Layers}
          title="Team Required for Project Submission"
          description="Every project belongs to a team in the database. Please create a team first before drafting a submission."
          actionLabel="Create a Team"
          onAction={() => navigate('/teams')}
        />
      </div>
    );
  }

  const isFinalized = submission?.status === 'SUBMITTED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="md">PROJECT WORKFLOW</Badge>
            {submission && (
              <Badge variant={submission.status} dot size="md">
                {submission.status}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-2">
            Project Submission Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build your project draft, attach URLs, and finalize before the submission deadline.
          </p>
        </div>

        {/* Team Selector */}
        <div className="sm:text-right">
          <label className="block text-[11px] font-mono text-slate-400 mb-1">Active Team</label>
          <select
            value={selectedTeamId}
            onChange={handleTeamChange}
            className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id} className="bg-surface text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* If No Draft Exists Yet: Initialize Step */}
      {!submission ? (
        <Card className="border border-white/10 p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-white">
              Initialize Project Draft
            </h3>
            <p className="text-xs text-slate-400">
              Create the initial database record for your team's project in <strong>{currentEvent?.name}</strong>.
            </p>
          </div>

          <form onSubmit={handleStartDraft} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Project Name
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. NeuroPulse EEG Analyzer"
                className="w-full glass-input rounded-xl px-4 py-3 text-base font-semibold text-white"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="glow" size="md" loading={saving} icon={Sparkles}>
                Create Draft & Begin
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Draft / Edit Form */
        <Card className="border border-white/10 p-6 sm:p-8 space-y-8">
          {isFinalized && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                    Project Finalized & Public
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    This submission is published in the gallery and queued for judge evaluation. You can still modify fields before deadline.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/gallery')}
              >
                View in Gallery
              </Button>
            </div>
          )}

          <div className="space-y-6">
            {/* Title & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-semibold"
                  placeholder="e.g. NeuroPulse"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Short Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  placeholder="One sentence pitch..."
                />
              </div>
            </div>

            {/* Track Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Select Track
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tracks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setFormData(prev => ({ ...prev, trackId: t.id }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.trackId === t.id
                        ? 'bg-primary-600/15 border-primary-500 shadow-md shadow-primary-500/10'
                        : 'bg-surface-elevated/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-sm text-white">{t.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Comprehensive Description
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does it do? How did you build it? What challenges did you run into?"
                className="w-full glass-input rounded-xl p-4 text-sm leading-relaxed"
                required
              />
            </div>

            {/* Links Section */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono block">
                Deliverables & Links
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" /> GitHub / Source Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
                    placeholder="https://github.com/team/project"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Live Production / Web Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                    placeholder="https://demo.project.dev"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Video Demo URL (YouTube / Loom)
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Tech Stack (Comma Separated)
              </label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData(prev => ({ ...prev, techStack: e.target.value }))}
                placeholder="Python, PyTorch, React, Spring Boot, Postgres, Kafka"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              size="md"
              icon={Save}
              loading={saving}
              onClick={handleSaveDraft}
            >
              Save Draft Edits
            </Button>

            {!isFinalized ? (
              <Button
                variant="glow"
                size="lg"
                icon={Send}
                loading={finalizing}
                onClick={handleFinalize}
              >
                Finalize & Submit Project
              </Button>
            ) : (
              <Button
                variant="success"
                size="md"
                icon={CheckCircle2}
                onClick={() => navigate('/gallery')}
              >
                Published in Gallery &rarr;
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
