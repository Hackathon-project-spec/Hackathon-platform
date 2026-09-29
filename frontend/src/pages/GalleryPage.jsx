import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, LayoutGrid, RefreshCw } from 'lucide-react';
import { getGallery } from '../api/submissions';
import { useEvent } from '../context/EventContext';
import ProjectCard from '../components/gallery/ProjectCard';
import { ProjectCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';

export default function GalleryPage() {
  const { currentEvent, tracks } = useEvent();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('ALL');

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGallery({
        eventId: currentEvent?.id,
        trackId: selectedTrack === 'ALL' ? undefined : selectedTrack,
        q: searchQuery.trim() || undefined,
      });
      setProjects(data || []);
    } catch (err) {
      console.error('Gallery fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id, selectedTrack, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGallery();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchGallery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="cyan" size="md">PUBLIC SHOWCASE</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-2">
            Project Gallery &amp; Submissions
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Explore finalized projects submitted to <strong>{currentEvent?.name}</strong>. Vote for your favorites and inspect source code.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, stack, tags..."
            className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Track Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedTrack('ALL')}
          className={`
            px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
            ${selectedTrack === 'ALL'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'bg-surface-elevated text-slate-400 hover:text-white border border-white/5'}
          `}
        >
          All Tracks ({projects.length})
        </button>

        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            className={`
              px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${selectedTrack === t.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'bg-surface-elevated text-slate-400 hover:text-white border border-white/5'}
            `}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No projects match your filter"
          description="Try clearing your search query or switching tracks to view other submissions."
          actionLabel="Reset Search"
          onAction={() => {
            setSearchQuery('');
            setSelectedTrack('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onVoted={fetchGallery} />
          ))}
        </div>
      )}
    </div>
  );
}
