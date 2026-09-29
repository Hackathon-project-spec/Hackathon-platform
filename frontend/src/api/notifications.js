import { apiClient } from './client';

export async function getMyNotifications() {
  try {
    return await apiClient('/api/notifications');
  } catch {
    return [
      { id: 'notif-1', type: 'TEAM_INVITE', message: 'You have been invited to join team "NeuroPulse" by Pat.', read: false, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'notif-2', type: 'SYSTEM', message: 'Hackathon Raptors Demo 2026 is LIVE! Submissions are now open.', read: false, createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
    ];
  }
}

export async function markNotificationRead(id) {
  try {
    await apiClient(`/api/notifications/${id}/read`, { method: 'POST' });
  } catch {}
}
