import { apiClient, getStoredUser } from './client';

export async function createTeam(eventId, name) {
  try {
    return await apiClient('/api/teams', {
      method: 'POST',
      body: { eventId, name },
    });
  } catch (err) {
    if (err.status === 0) {
      // Offline fallback state saved to localStorage
      const user = getStoredUser();
      const newTeam = {
        id: 'team-' + Date.now(),
        eventId,
        name,
        ownerId: user?.id,
        createdAt: new Date().toISOString(),
        members: [{ userId: user?.id, role: 'OWNER', joinedAt: new Date().toISOString() }],
      };
      saveLocalTeam(newTeam);
      return newTeam;
    }
    throw err;
  }
}

export async function getTeam(id) {
  try {
    return await apiClient(`/api/teams/${id}`);
  } catch (err) {
    const local = getLocalTeams().find(t => t.id === id);
    if (local) return local;
    throw err;
  }
}

export async function getTeamsByEvent(eventId) {
  try {
    return await apiClient('/api/teams', { params: { eventId } });
  } catch (err) {
    return getLocalTeams().filter(t => t.eventId === eventId);
  }
}

export async function getMyTeams() {
  try {
    return await apiClient('/api/teams/mine');
  } catch (err) {
    const user = getStoredUser();
    return getLocalTeams().filter(t => t.members.some(m => m.userId === user?.id));
  }
}

export async function createInvite(teamId, { expiresAt, maxUses = 5 } = {}) {
  try {
    return await apiClient(`/api/teams/${teamId}/invites`, {
      method: 'POST',
      body: { expiresAt: expiresAt || new Date(Date.now() + 86400000 * 3).toISOString(), maxUses },
    });
  } catch (err) {
    if (err.status === 0) {
      const invite = {
        id: 'inv-' + Date.now(),
        teamId,
        token: 'DEMO-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        maxUses: maxUses || 5,
        usesCount: 0,
        revoked: false,
      };
      saveLocalInvite(invite);
      return invite;
    }
    throw err;
  }
}

export async function revokeInvite(inviteId) {
  return await apiClient(`/api/teams/invites/${inviteId}`, {
    method: 'DELETE',
  });
}

export async function acceptInvite(token) {
  try {
    return await apiClient(`/api/invites/${encodeURIComponent(token)}/accept`, {
      method: 'POST',
    });
  } catch (err) {
    if (err.status === 0) {
      const user = getStoredUser();
      const localTeams = getLocalTeams();
      if (localTeams.length > 0) {
        const team = localTeams[0];
        if (!team.members.some(m => m.userId === user?.id)) {
          team.members.push({ userId: user?.id, role: 'MEMBER', joinedAt: new Date().toISOString() });
          saveLocalTeam(team);
        }
        return team;
      }
    }
    throw err;
  }
}

// Local storage mock helpers for offline resilience
function getLocalTeams() {
  try {
    return JSON.parse(localStorage.getItem('hp_local_teams') || '[]');
  } catch {
    return [];
  }
}

function saveLocalTeam(team) {
  const current = getLocalTeams().filter(t => t.id !== team.id);
  current.push(team);
  localStorage.setItem('hp_local_teams', JSON.stringify(current));
}

function saveLocalInvite(invite) {
  try {
    const list = JSON.parse(localStorage.getItem('hp_local_invites') || '[]');
    list.push(invite);
    localStorage.setItem('hp_local_invites', JSON.stringify(list));
  } catch {}
}
