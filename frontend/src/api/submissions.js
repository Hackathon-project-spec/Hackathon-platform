import { apiClient, getStoredUser } from './client';

export const SEEDED_GALLERY_PROJECTS = [
  {
    id: 'sub-3001',
    eventId: '20000000-0000-0000-0000-000000000001',
    teamId: 'team-demo-01',
    trackId: 'track-1001',
    title: 'NeuroPulse: Real-Time EEG Emotion Mapping',
    tagline: 'Edge AI inference for non-invasive neural feedback and wellness monitoring',
    description: 'NeuroPulse combines lightweight transformer models running on ONNX with consumer EEG headbands to translate raw brainwave data into localized emotional valences in sub-20ms latency. Includes a physician-facing telemetry dashboard and encrypted session exports.',
    repoUrl: 'https://github.com/example/neuropulse-ai',
    demoUrl: 'https://neuropulse-demo.dev',
    videoUrl: 'https://youtube.com/watch?v=demo1',
    coverImageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
    techStack: 'Python, PyTorch, React, WebSockets, Tailwind, FastAPI',
    status: 'SUBMITTED',
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    votes: 42,
  },
  {
    id: 'sub-3002',
    eventId: '20000000-0000-0000-0000-000000000001',
    teamId: 'team-demo-02',
    trackId: 'track-1002',
    title: 'HyperRoute: Zero-Loss Resilient Mesh Network',
    tagline: 'Peer-to-peer decentralized mesh transport for disaster response and offline comms',
    description: 'HyperRoute leverages WebRTC datachannels, Bluetooth Low Energy, and Wi-Fi Direct to construct self-healing peer-to-peer mesh networks. Citizens can broadcast emergency packets and coordinate medical resources without relying on active cellular towers.',
    repoUrl: 'https://github.com/example/hyperroute-mesh',
    demoUrl: 'https://hyperroute.network',
    videoUrl: 'https://youtube.com/watch?v=demo2',
    coverImageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    techStack: 'Rust, WebAssembly, TypeScript, WebRTC, IndexedDB',
    status: 'SUBMITTED',
    submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    votes: 38,
  },
  {
    id: 'sub-3003',
    eventId: '20000000-0000-0000-0000-000000000001',
    teamId: 'team-demo-03',
    trackId: 'track-1001',
    title: 'SynthCode: Autonomous Microservice Refactoring Agent',
    tagline: 'Multi-agent LLM framework that decomposes monolithic codebases into verified microservices',
    description: 'SynthCode inspects ASTs, maps dependency boundaries, and orchestrates verification agents that extract isolated Spring Boot / Go microservices with complete OpenAPI contracts and Kafka event bridges.',
    repoUrl: 'https://github.com/example/synthcode-core',
    demoUrl: 'https://synthcode.dev',
    videoUrl: 'https://youtube.com/watch?v=demo3',
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    techStack: 'Go, LangGraph, Python, Docker, React, Monaco Editor',
    status: 'SUBMITTED',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    votes: 56,
  }
];

export async function createDraft({ eventId, teamId, title }) {
  try {
    return await apiClient('/api/submissions', {
      method: 'POST',
      body: { eventId, teamId, title },
    });
  } catch (err) {
    if (err.status === 0) {
      const draft = {
        id: 'sub-' + Date.now(),
        eventId,
        teamId,
        title,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveLocalSubmission(draft);
      return draft;
    }
    throw err;
  }
}

export async function getSubmission(id) {
  try {
    return await apiClient(`/api/submissions/${id}`);
  } catch (err) {
    const found = [...SEEDED_GALLERY_PROJECTS, ...getLocalSubmissions()].find(s => s.id === id);
    if (found) return found;
    throw err;
  }
}

export async function updateSubmission(id, updates) {
  try {
    return await apiClient(`/api/submissions/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  } catch (err) {
    if (err.status === 0) {
      const current = await getSubmission(id);
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      saveLocalSubmission(updated);
      return updated;
    }
    throw err;
  }
}

export async function finalizeSubmission(id) {
  try {
    return await apiClient(`/api/submissions/${id}/finalize`, {
      method: 'POST',
    });
  } catch (err) {
    if (err.status === 0) {
      const current = await getSubmission(id);
      const finalized = { ...current, status: 'SUBMITTED', submittedAt: new Date().toISOString() };
      saveLocalSubmission(finalized);
      return finalized;
    }
    throw err;
  }
}

export async function getSubmissionByTeam(eventId, teamId) {
  try {
    return await apiClient('/api/submissions/by-team', { params: { eventId, teamId } });
  } catch (err) {
    return getLocalSubmissions().find(s => s.eventId === eventId && s.teamId === teamId) || null;
  }
}

export async function getGallery({ eventId, trackId, q } = {}) {
  try {
    const list = await apiClient('/api/gallery', { params: { eventId, trackId, q } });
    if (list && list.length > 0) return list;
  } catch (err) {
    console.warn('Backend gallery error, falling back to local dataset:', err.message);
  }

  // Fallback combine seeded + local submissions
  let pool = [...SEEDED_GALLERY_PROJECTS, ...getLocalSubmissions().filter(s => s.status === 'SUBMITTED')];
  if (trackId) {
    pool = pool.filter(p => p.trackId === trackId);
  }
  if (q) {
    const term = q.toLowerCase();
    pool = pool.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.tagline?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.techStack?.toLowerCase().includes(term)
    );
  }
  return pool;
}

export async function voteSubmission(submissionId) {
  try {
    await apiClient(`/api/gallery/${submissionId}/vote`, { method: 'POST' });
  } catch (err) {
    if (err.status === 0) {
      // Local vote toggle
      const votes = JSON.parse(localStorage.getItem('hp_user_votes') || '[]');
      if (!votes.includes(submissionId)) {
        votes.push(submissionId);
        localStorage.setItem('hp_user_votes', JSON.stringify(votes));
      }
      return;
    }
    throw err;
  }
}

export async function getVoteTally(submissionId) {
  try {
    return await apiClient(`/api/gallery/${submissionId}/tally`);
  } catch {
    const seeded = SEEDED_GALLERY_PROJECTS.find(s => s.id === submissionId);
    return { submissionId, votes: seeded?.votes || Math.floor(Math.random() * 30 + 10) };
  }
}

export async function getComments(submissionId) {
  try {
    return await apiClient(`/api/gallery/${submissionId}/comments`);
  } catch {
    const local = JSON.parse(localStorage.getItem(`hp_comments_${submissionId}`) || '[]');
    return local.length > 0 ? local : [
      { id: 'c1', authorId: '00000000-0000-0000-0000-000000000002', body: 'Fantastic architecture! The sub-20ms latency benchmark is remarkable.', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'c2', authorId: '00000000-0000-0000-0000-000000000003', body: 'Great UX and clean repo structure. Testing on mobile was smooth.', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ];
  }
}

export async function addComment(submissionId, body) {
  try {
    return await apiClient(`/api/gallery/${submissionId}/comments`, {
      method: 'POST',
      body: { body },
    });
  } catch (err) {
    if (err.status === 0) {
      const user = getStoredUser();
      const newComment = {
        id: 'c-' + Date.now(),
        authorId: user?.id,
        body,
        createdAt: new Date().toISOString(),
      };
      const list = JSON.parse(localStorage.getItem(`hp_comments_${submissionId}`) || '[]');
      list.push(newComment);
      localStorage.setItem(`hp_comments_${submissionId}`, JSON.stringify(list));
      return newComment;
    }
    throw err;
  }
}

function getLocalSubmissions() {
  try {
    return JSON.parse(localStorage.getItem('hp_local_submissions') || '[]');
  } catch {
    return [];
  }
}

function saveLocalSubmission(sub) {
  const current = getLocalSubmissions().filter(s => s.id !== sub.id);
  current.push(sub);
  localStorage.setItem('hp_local_submissions', JSON.stringify(current));
}
