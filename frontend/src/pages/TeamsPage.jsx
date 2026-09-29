import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Link as LinkIcon,
  Copy,
  Check,
  Crown,
  Shield,
  Clock,
  Plus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { getMyTeams, getTeamsByEvent, createTeam, createInvite, acceptInvite } from '../api/teams';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

export default function TeamsPage() {
  const { currentEvent } = useEvent();
  const { user, isParticipant } = useAuth();
  const { showToast } = useNotifications();

  const [myTeams, setMyTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [creating, setCreating] = useState(false);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTeamForInvite, setActiveTeamForInvite] = useState(null);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [inviteTokenInput, setInviteTokenInput] = useState('');
  const [joining, setJoining] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, eventTeams] = await Promise.all([
        getMyTeams().catch(() => []),
        getTeamsByEvent(currentEvent?.id).catch(() => []),
      ]);
      setMyTeams(mine || []);
      setAllTeams(eventTeams || []);
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setCreating(true);
    try {
      const team = await createTeam(currentEvent?.id, teamName.trim());
      showToast(`Team "${team.name}" formed successfully!`, 'success');
      setTeamName('');
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateInvite = async (team) => {
    setActiveTeamForInvite(team);
    setInviteModalOpen(true);
    setGeneratingInvite(true);
    try {
      const invite = await createInvite(team.id, { maxUses: 4 });
      setGeneratedInvite(invite);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleCopyInvite = () => {
    if (!generatedInvite?.token) return;
    navigator.clipboard.writeText(generatedInvite.token);
    setCopied(true);
    showToast('Invite code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!inviteTokenInput.trim()) return;

    setJoining(true);
    try {
      const joined = await acceptInvite(inviteTokenInput.trim());
      showToast(`Successfully joined "${joined.name}"!`, 'success');
      setInviteTokenInput('');
      setJoinModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="success" size="md">COLLABORATION</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-2">
            Teams & Invite Links
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Form a squad, invite co-hackers via cryptographic invite codes, or accept an invitation to join an existing team.
          </p>
        </div>

        {isParticipant && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={UserPlus}
              onClick={() => setJoinModalOpen(true)}
            >
              Join via Code
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Team
            </Button>
          </div>
        )}
      </div>

      {/* My Active Teams Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          My Teams ({myTeams.length})
        </h2>

        {myTeams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="You haven't formed or joined a team yet"
            description="Create a new team to begin building your hackathon project, or ask a teammate for their invite code."
            actionLabel={isParticipant ? "Create Your Team" : null}
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTeams.map((team) => {
              const isOwner = team.ownerId === user?.id;
              const members = team.members || [];
              return (
                <Card key={team.id} className="border border-white/10 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-xl text-white">
                          {team.name}
                        </h3>
                        {isOwner && (
                          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30">
                            <Crown className="w-3 h-3 text-amber-400" /> Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Team ID: {team.id}
                      </p>
                    </div>

                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={LinkIcon}
                        onClick={() => handleGenerateInvite(team)}
                      >
                        Invite Link
                      </Button>
                    )}
                  </div>

                  {/* Members list */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                      Roster ({members.length} / {currentEvent?.maxTeamSize || 4} Members)
                    </span>
                    <div className="space-y-2">
                      {members.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary-600/30 text-primary-300 font-mono flex items-center justify-center font-bold">
                              {m.role === 'OWNER' ? '👑' : '👤'}
                            </div>
                            <div>
                              <span className="font-mono text-slate-200">
                                User #{m.userId?.substring(0, 8)}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Joined {formatDate(m.joinedAt)}
                              </span>
                            </div>
                          </div>

                          <Badge variant={m.role === 'OWNER' ? 'warning' : 'default'} size="sm">
                            {m.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Form a New Hackathon Team"
        subtitle={`Event: ${currentEvent?.name}`}
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Neural Raptors"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <strong>Backend Rule:</strong> One team per participant per event. You will become the team OWNER and can generate invite links for up to {currentEvent?.maxTeamSize || 4} members.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={creating}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Invite Members to ${activeTeamForInvite?.name}`}
        subtitle="Share this cryptographic invite code with prospective teammates"
      >
        <div className="space-y-4 text-sm">
          {generatingInvite ? (
            <div className="py-8 text-center text-xs text-slate-400">Generating invite token...</div>
          ) : generatedInvite ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-between gap-3">
                <span className="font-mono text-lg font-bold text-emerald-400 tracking-wider">
                  {generatedInvite.token}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopyInvite}
                >
                  {copied ? 'Copied' : 'Copy Code'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-500 block">Remaining Uses</span>
                  <span className="text-white font-mono font-semibold">
                    {generatedInvite.maxUses - generatedInvite.usesCount} / {generatedInvite.maxUses}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-500 block">Expires</span>
                  <span className="text-white font-mono font-semibold">
                    {formatDate(generatedInvite.expiresAt)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Send this code to other registered participants (such as Robin / participant2). When they enter this code, they will be joined into your team immediately.
              </p>
            </div>
          ) : null}

          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setInviteModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Join via Code Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join Team by Invite Code"
        subtitle="Enter the code provided by your team owner"
      >
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteTokenInput}
              onChange={(e) => setInviteTokenInput(e.target.value.toUpperCase())}
              placeholder="e.g. DEMO-X8K9Z"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest text-emerald-300"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={joining}>
              Join Team
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
