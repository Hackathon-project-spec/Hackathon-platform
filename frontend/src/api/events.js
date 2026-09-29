import { apiClient } from './client';

export const DEMO_EVENT_ID = import.meta.env.VITE_DEMO_EVENT_ID || '20000000-0000-0000-0000-000000000001';

export const SEEDED_FALLBACK_EVENT = {
  id: DEMO_EVENT_ID,
  name: 'Hackathon Raptors Demo 2026',
  description: 'A self-hostable, API-first hackathon: registration, teams, submissions, public gallery, weighted rubrics, and cross-judge score normalization.',
  organizerId: '00000000-0000-0000-0000-000000000002',
  status: 'LIVE',
  registrationOpensAt: new Date(Date.now() - 86400000).toISOString(),
  registrationClosesAt: new Date(Date.now() + 86400000 * 6).toISOString(),
  hackingStartsAt: new Date(Date.now() - 86400000).toISOString(),
  submissionDeadline: new Date(Date.now() + 86400000 * 7).toISOString(),
  votingOpensAt: new Date(Date.now() + 86400000 * 7).toISOString(),
  votingClosesAt: new Date(Date.now() + 86400000 * 9).toISOString(),
  judgingOpensAt: new Date(Date.now() + 86400000 * 7).toISOString(),
  judgingClosesAt: new Date(Date.now() + 86400000 * 9).toISOString(),
  resultsPublishedAt: new Date(Date.now() + 86400000 * 10).toISOString(),
  resultsHiddenDuringVoting: true,
  maxTeamSize: 4,
  tracks: [
    { id: 'track-1001', name: 'AI / ML', description: 'Projects applying machine learning to real-world problems.' },
    { id: 'track-1002', name: 'Web & Mobile', description: 'Full-stack or mobile applications solving everyday needs.' },
  ],
  prizes: [
    { id: 'prize-2001', title: 'Grand Prize', description: 'Best overall project across all tracks ($10,000)', rank: 1 },
    { id: 'prize-2002', title: 'Best AI/ML Innovation', description: 'Outstanding technical depth and AI pipeline ($4,000)', rank: 1 },
  ]
};

export async function getPublicEvents() {
  try {
    const events = await apiClient('/api/events/public');
    return events?.length > 0 ? events : [SEEDED_FALLBACK_EVENT];
  } catch (err) {
    console.warn('Backend events call failed, returning seeded demo event:', err.message);
    return [SEEDED_FALLBACK_EVENT];
  }
}

export async function getAllEvents() {
  try {
    const events = await apiClient('/api/events');
    return events?.length > 0 ? events : [SEEDED_FALLBACK_EVENT];
  } catch (err) {
    return [SEEDED_FALLBACK_EVENT];
  }
}

export async function getEvent(id = DEMO_EVENT_ID) {
  try {
    return await apiClient(`/api/events/${id}`);
  } catch (err) {
    if (id === DEMO_EVENT_ID) return SEEDED_FALLBACK_EVENT;
    throw err;
  }
}

export async function createEvent(data) {
  return await apiClient('/api/events', {
    method: 'POST',
    body: data,
  });
}

export async function updateTimeline(eventId, timelineData) {
  return await apiClient(`/api/events/${eventId}/timeline`, {
    method: 'PATCH',
    body: timelineData,
  });
}

export async function changeEventStatus(eventId, status) {
  return await apiClient(`/api/events/${eventId}/status?status=${encodeURIComponent(status)}`, {
    method: 'POST',
  });
}

export async function addTrack(eventId, trackData) {
  return await apiClient(`/api/events/${eventId}/tracks`, {
    method: 'POST',
    body: trackData,
  });
}

export async function addPrize(eventId, prizeData) {
  return await apiClient(`/api/events/${eventId}/prizes`, {
    method: 'POST',
    body: prizeData,
  });
}
