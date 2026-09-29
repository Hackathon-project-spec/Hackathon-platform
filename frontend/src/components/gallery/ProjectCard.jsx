import React, { useState } from 'react';
import { ExternalLink, Github, ThumbsUp, ArrowUpRight, Code, MessageSquare } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProjectDetailModal from './ProjectDetailModal';
import { voteSubmission } from '../../api/submissions';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function ProjectCard({ project, onVoted }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const { showToast } = useNotifications();
  const { isOrganizer } = useAuth();

  const handleVoteQuick = async (e) => {
    e.stopPropagation();
    setVoting(true);
    try {
      await voteSubmission(project.id);
      showToast(`Vote recorded for "${project.title}"`, 'success');
      if (onVoted) onVoted(project.id);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setVoting(false);
    }
  };

  const techList = project.techStack
    ? project.techStack.split(',').map((t) => t.trim()).slice(0, 3)
    : [];

  return (
    <>
      <Card
        hover
        padding="p-0"
        onClick={() => setModalOpen(true)}
        className="flex flex-col h-full group"
      >
        {/* Thumbnail banner */}
        <div className="relative h-44 w-full overflow-hidden bg-surface-elevated">
          {project.coverImageUrl ? (
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary-900/50 via-surface to-surface-elevated flex items-center justify-center text-primary-400">
              <Code className="w-12 h-12 opacity-40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={project.status || 'SUBMITTED'} dot size="sm">
              {project.status || 'SUBMITTED'}
            </Badge>
          </div>

          {/* Quick link button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-1.5 rounded-lg bg-surface/80 backdrop-blur-md text-white border border-white/10 hover:bg-primary-600 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-primary-300 transition-colors line-clamp-1 mb-1.5">
              {project.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
              {project.tagline || project.description || 'No description provided.'}
            </p>

            {/* Tech Stack Pills */}
            {techList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {techList.map((tech, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.split(',').length > 3 && (
                  <span className="text-[11px] font-mono text-slate-500 self-center">
                    +{project.techStack.split(',').length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card Footer: Vote button & links */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleVoteQuick}
                disabled={voting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-primary-600/20 text-slate-300 hover:text-primary-300 border border-white/10 hover:border-primary-500/30 text-xs font-medium transition-all"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${voting ? 'animate-bounce' : ''}`} />
                <span>Vote</span>
              </button>
            </div>

            <span className="text-xs font-medium text-primary-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Details &rarr;
            </span>
          </div>
        </div>
      </Card>

      <ProjectDetailModal
        project={project}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onVoted={onVoted}
      />
    </>
  );
}
