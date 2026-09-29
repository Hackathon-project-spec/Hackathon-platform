import { apiClient, setStoredToken, setStoredUser, getStoredToken, getStoredUser } from './client';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'hackathon';
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'hackathon-frontend';

// One-click demo account switcher (top bar + landing page buttons). Off by default:
// a normal build shows no pre-made identities. Enable with VITE_DEMO_MODE=true.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const ROLE_PRIORITY = ['ADMIN', 'ORGANIZER', 'JUDGE', 'PARTICIPANT'];

/** Decode a JWT payload (no signature check -- the backend is what verifies tokens). */
export function decodeJwt(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(part))));
  } catch {
    return null;
  }
}

/** True only for a well-formed, unexpired token. */
export function isTokenValid(token) {
  const claims = token ? decodeJwt(token) : null;
  return !!claims && typeof claims.exp === 'number' && claims.exp * 1000 > Date.now() + 5000;
}

/** Build a user object strictly from the token's own claims. */
function userFromToken(token, fallbackUsername) {
  const c = decodeJwt(token) || {};
  const roles = c.realm_access?.roles || [];
  return {
    id: c.sub,
    email: c.email || `${fallbackUsername}@hackathonraptors.dev`,
    firstName: c.given_name || fallbackUsername,
    lastName: c.family_name || '',
    primaryRole: ROLE_PRIORITY.find((r) => roles.includes(r)) || 'PARTICIPANT',
  };
}

export const DEMO_ACCOUNTS = [
  {
    username: 'participant1',
    password: 'Passw0rd!',
    name: 'Pat Participant',
    role: 'PARTICIPANT',
    id: '00000000-0000-0000-0000-000000000005',
    email: 'participant1@hackathonraptors.dev',
    desc: 'Hacker: Creates teams, submits projects, votes',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    username: 'participant2',
    password: 'Passw0rd!',
    name: 'Robin Participant',
    role: 'PARTICIPANT',
    id: '00000000-0000-0000-0000-000000000006',
    email: 'participant2@hackathonraptors.dev',
    desc: 'Teammate: Joins teams via invite code, collaborates',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
  },
  {
    username: 'organizer1',
    password: 'Passw0rd!',
    name: 'Ola Organizer',
    role: 'ORGANIZER',
    id: '00000000-0000-0000-0000-000000000002',
    email: 'organizer1@hackathonraptors.dev',
    desc: 'Event Host: Configures rubrics, assigns judges, exports CSVs',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    username: 'judge1',
    password: 'Passw0rd!',
    name: 'Jan Judge',
    role: 'JUDGE',
    id: '00000000-0000-0000-0000-000000000003',
    email: 'judge1@hackathonraptors.dev',
    desc: 'Evaluator: Scores assigned projects against rubrics',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    username: 'judge2',
    password: 'Passw0rd!',
    name: 'Jamie Judge',
    role: 'JUDGE',
    id: '00000000-0000-0000-0000-000000000004',
    email: 'judge2@hackathonraptors.dev',
    desc: 'Evaluator: Cross-judge z-score normalization demo',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
  },
  {
    username: 'admin1',
    password: 'Passw0rd!',
    name: 'Alex Admin',
    role: 'ADMIN',
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin1@hackathonraptors.dev',
    desc: 'Platform Administrator: Full system oversight',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }
];

/**
 * Log in via Keycloak Direct Access Grant (ROPC).
 * Fails (no simulated session) if Keycloak is unreachable.
 */
export async function loginWithCredentials(username, password) {
  const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
  const body = new URLSearchParams();
  body.append('grant_type', 'password');
  body.append('client_id', CLIENT_ID);
  body.append('username', username);
  body.append('password', password);

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      setStoredToken(data.access_token);

      // Now sync identity with user-service
      try {
        const syncedUser = await syncUserWithBackend();
        setStoredUser(syncedUser);
        return { user: syncedUser, token: data.access_token, isRealBackend: true };
      } catch (syncErr) {
        console.warn('Backend sync failed, decoding JWT claims locally', syncErr);
        const fallbackUser = userFromToken(data.access_token, username);
        setStoredUser(fallbackUser);
        return { user: fallbackUser, token: data.access_token, isRealBackend: true };
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error_description || 'Invalid credentials');
    }
  } catch (err) {
    // Never fabricate a session: if Keycloak is unreachable or rejects the login, fail.
    if (err.name === 'TimeoutError' || err.name === 'TypeError') {
      throw new Error('Cannot reach the authentication service. Is Keycloak running on ' + KEYCLOAK_URL + '?');
    }
    throw new Error(err.message || 'Authentication failed');
  }
}

/**
 * Call POST /api/users/sync to mirror the Keycloak user into userdb
 */
export async function syncUserWithBackend() {
  return await apiClient('/api/users/sync', { method: 'POST' });
}

/**
 * Call GET /api/users/me
 */
export async function getMe() {
  return await apiClient('/api/users/me');
}

/**
 * Call GET /api/users (ORGANIZER/ADMIN only)
 */
export async function listAllUsers() {
  return await apiClient('/api/users');
}

/**
 * Clear stored token and user
 */
export function logout() {
  setStoredToken(null);
  setStoredUser(null);
}