import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Github,
  Video,
  ThumbsUp,
  MessageSquare,
  Send,
  Calendar,
  Layers,
  Award,
  Lock,
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { voteSubmission, getVoteTally, getComments, addComment } from '../../api/submissions';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

export default function ProjectDetailModal({ project, isOpen, onClose, onVoted }) {
  const { isOrganizer, user } = useAuth();
  const { showToast } = useNotifications();
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteCount, setVoteCount] = useState(project?.votes || null);
  const [loadingTally, setLoadingTally] = useState(false);

  useEffect(() => {
    if (project?.id && isOpen) {
      loadComments();
      if (isOrganizer) {
        loadTally();
      }
    }
  }, [project?.id, isOpen, isOrganizer]);

  const loadComments = async () => {
    try {
      const data = await getComments(project.id);
      setComments(data || []);
    } catch {}
  };

  const loadTally = async () => {
    setLoadingTally(true);
    try {
      const res = await getVoteTally(project.id);
      setVoteCount(res.votes);
    } catch {}
    setLoadingTally(false);
  };

  const handleVote = async () => {
    setVoting(true);
    try {
      await voteSubmission(project.id);
      showToast('Vote successfully cast for ' + project.title, 'success');
      if (onVoted) onVoted(project.id);
      if (isOrganizer) loadTally();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setVoting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    setLoadingComment(true);
    try {
      const newC = await addComment(project.id, commentBody.trim());
      setComments(prev => [...prev, newC]);
      setCommentBody('');
      showToast('Comment posted', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingComment(false);
    }
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      subtitle={project.tagline}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Cover Image Banner */}
        {project.coverImageUrl ? (
          <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden relative border border-white/10">
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Badge variant={project.status || 'SUBMITTED'} dot size="md">
                {project.status || 'SUBMITTED'}
              </Badge>
              {isOrganizer && voteCount !== null && (
                <div className="bg-surface-elevated/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 shadow-lg">
                  <ThumbsUp className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>{voteCount} Votes</span>
                  <span className="text-[10px] text-slate-400 font-mono">(Organizer view)</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Links & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface-elevated/60 border border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 border border-white/10 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600/20 hover:bg-primary-600/30 text-xs font-medium text-primary-300 border border-primary-500/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Demo</span>
              </a>
            )}
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 border border-rose-500/30 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Demo Video</span>
              </a>
            )}
          </div>

          <Button
            variant="glow"
            size="sm"
            icon={ThumbsUp}
            loading={voting}
            onClick={handleVote}
          >
            Vote for Project
          </Button>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
            About the Project
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-surface/40 p-4 rounded-2xl border border-white/5">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Tech Stack */}
        {project.techStack && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.split(',').map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300 font-mono"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata info row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block">Submitted At</span>
            <span className="text-slate-200 font-medium">{formatDate(project.submittedAt || project.createdAt)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Team ID</span>
            <span className="text-slate-200 font-mono">{project.teamId?.substring(0, 12)}...</span>
          </div>
          <div>
            <span className="text-slate-500 block">Voting Window</span>
            <span className="text-emerald-400 font-medium">Open &bull; One vote per identity</span>
          </div>
        </div>

        {/* Community Comments Section (T3 Feature) */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary-400" />
            <h4 className="text-sm font-semibold text-white">Community Discussion & Feedback</h4>
            <span className="text-xs text-slate-400">({comments.length})</span>
          </div>

          {/* Add comment input */}
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Leave constructive feedback or ask the team a question..."
              className="flex-1 glass-input rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary-500"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              loading={loadingComment}
              disabled={!commentBody.trim()}
              icon={Send}
            >
              Post
            </Button>
          </form>

          {/* Comments list */}
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-[11px] text-primary-400">Hacker #{c.authorId?.substring(0, 8)}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-slate-200">{c.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
