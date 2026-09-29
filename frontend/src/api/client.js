/**
 * Base API client for Hackathon Raptors Platform
 * Supports automatic JWT token attachment, Vite proxy fallback, timeout, and custom error formats.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken() {
  return localStorage.getItem('hp_access_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('hp_access_token', token);
  } else {
    localStorage.removeItem('hp_access_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('hp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('hp_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('hp_user');
  }
}

export async function apiClient(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    params,
    isBlob = false,
    timeoutMs = 15000,
    ...rest
  } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders = new Headers(headers);
  const token = getStoredToken();
  if (token && !reqHeaders.has('Authorization')) {
    reqHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (body && !(body instanceof FormData) && !reqHeaders.has('Content-Type')) {
    reqHeaders.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
      signal: controller.signal,
      ...rest,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errData = null;
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const text = await response.text();
        errData = text ? JSON.parse(text) : null;
        errMsg = errData?.message || errData?.error || text || errMsg;
      } catch {
        // Ignored, use default message
      }

      if (response.status === 401) {
        // Token might be expired
        errMsg = 'Your session has expired. Please log in again.';
      } else if (response.status === 403) {
        errMsg = 'Access denied. Your role is not authorized for this action.';
      } else if (response.status === 404) {
        errMsg = errMsg || 'Requested resource not found.';
      }

      throw new ApiError(errMsg, response.status, errData);
    }

    if (isBlob) {
      return await response.blob();
    }

    // Handle 204 or empty content
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out after 15s. The server may be busy.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network connection failed. Make sure the backend is running.', 0);
  }
}

/** Check if API Gateway is reachable */
export async function checkGatewayHealth() {
  try {
    const res = await fetch(`${BASE_URL}/actuator/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
