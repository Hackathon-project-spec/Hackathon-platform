import { apiClient, getStoredUser } from './client';

export const SEEDED_RUBRIC = {
  id: 'rubric-demo-01',
  eventId: '20000000-0000-0000-0000-000000000001',
  name: 'Standard Technical & Impact Rubric',
  active: true,
  criteria: [
    {
      id: 'crit-01',
      name: 'Technical Execution & Architecture',
      description: 'System design, code quality, stability, microservices/API soundness, and resilience.',
      weight: 3.0,
      minScore: 0.0,
      maxScore: 10.0,
    },
    {
      id: 'crit-02',
      name: 'Innovation & Creativity',
      description: 'Originality of the solution, novel application of AI/technologies, and domain impact.',
      weight: 2.5,
      minScore: 0.0,
      maxScore: 10.0,
    },
    {
      id: 'crit-03',
      name: 'Product Design & User Experience',
      description: 'Intuitive interface, aesthetic polish, responsiveness, and clear presentation.',
      weight: 2.0,
      minScore: 0.0,
      maxScore: 10.0,
    },
    {
      id: 'crit-04',
      name: 'Viability & Business Practicality',
      description: 'Realistic market potential, self-hostability, or open-source ecosystem value.',
      weight: 1.5,
      minScore: 0.0,
      maxScore: 10.0,
    }
  ]
};

export async function createRubric({ eventId, name, criteria, activate = true }) {
  try {
    return await apiClient('/api/rubrics', {
      method: 'POST',
      body: { eventId, name, criteria, activate },
    });
  } catch (err) {
    if (err.status === 0) {
      const created = {
        id: 'rubric-' + Date.now(),
        eventId,
        name,
        active: activate,
        criteria: criteria.map((c, i) => ({ id: `crit-${i + 1}`, ...c })),
      };
      localStorage.setItem(`hp_rubric_${eventId}`, JSON.stringify(created));
      return created;
    }
    throw err;
  }
}

export async function getRubrics(eventId) {
  try {
    const list = await apiClient('/api/rubrics', { params: { eventId } });
    if (list?.length > 0) return list;
  } catch {}
  return [SEEDED_RUBRIC];
}

export async function getActiveRubric(eventId) {
  try {
    return await apiClient('/api/rubrics/active', { params: { eventId } });
  } catch (err) {
    const stored = localStorage.getItem(`hp_rubric_${eventId}`);
    return stored ? JSON.parse(stored) : SEEDED_RUBRIC;
  }
}

export async function activateRubric(id) {
  return await apiClient(`/api/rubrics/${id}/activate`, { method: 'POST' });
}

export async function assignBatch({ eventId, judgeIds, reviewsPerSubmission = 2 }) {
  try {
    return await apiClient('/api/judging/assign', {
      method: 'POST',
      body: { eventId, judgeIds, reviewsPerSubmission },
    });
  } catch (err) {
    if (err.status === 0) {
      // Simulate greedy assignments across demo projects
      const submissions = ['sub-3001', 'sub-3002', 'sub-3003'];
      const assignments = [];
      submissions.forEach(subId => {
        judgeIds.slice(0, reviewsPerSubmission).forEach(jId => {
          assignments.push({
            id: `assign-${subId}-${jId}`,
            judgeId: jId,
            submissionId: subId,
            complete: false,
            assignedAt: new Date().toISOString(),
          });
        });
      });
      localStorage.setItem(`hp_assignments_${eventId}`, JSON.stringify(assignments));
      return assignments;
    }
    throw err;
  }
}

export async function getMyAssignments(eventId) {
  try {
    return await apiClient('/api/judging/assignments/mine', { params: { eventId } });
  } catch (err) {
    const user = getStoredUser();
    const stored = JSON.parse(localStorage.getItem(`hp_assignments_${eventId}`) || '[]');
    const mine = stored.filter(a => a.judgeId === user?.id);
    if (mine.length > 0) return mine;

    // Default seeded assignments for Jan Judge (judge1)
    if (user?.id === '00000000-0000-0000-0000-000000000003' || user?.primaryRole === 'JUDGE') {
      return [
        { id: 'asgn-1', judgeId: user?.id, submissionId: 'sub-3001', complete: false, assignedAt: new Date().toISOString() },
        { id: 'asgn-2', judgeId: user?.id, submissionId: 'sub-3002', complete: false, assignedAt: new Date().toISOString() },
        { id: 'asgn-3', judgeId: user?.id, submissionId: 'sub-3003', complete: false, assignedAt: new Date().toISOString() },
      ];
    }
    return [];
  }
}

export async function getAllAssignments(eventId) {
  try {
    return await apiClient('/api/judging/assignments', { params: { eventId } });
  } catch {
    const stored = JSON.parse(localStorage.getItem(`hp_assignments_${eventId}`) || '[]');
    return stored.length > 0 ? stored : [
      { id: 'asgn-1', judgeId: '00000000-0000-0000-0000-000000000003', submissionId: 'sub-3001', complete: true },
      { id: 'asgn-2', judgeId: '00000000-0000-0000-0000-000000000003', submissionId: 'sub-3002', complete: true },
      { id: 'asgn-3', judgeId: '00000000-0000-0000-0000-000000000004', submissionId: 'sub-3001', complete: false },
      { id: 'asgn-4', judgeId: '00000000-0000-0000-0000-000000000004', submissionId: 'sub-3003', complete: true },
    ];
  }
}

export async function submitScores({ eventId, submissionId, scores, notes = {} }) {
  try {
    return await apiClient('/api/judging/scores', {
      method: 'POST',
      body: { eventId, submissionId, scores, notes },
    });
  } catch (err) {
    if (err.status === 0) {
      const user = getStoredUser();
      const key = `hp_scores_${eventId}_${submissionId}_${user?.id}`;
      localStorage.setItem(key, JSON.stringify({ scores, notes, timestamp: new Date().toISOString() }));
      return { success: true };
    }
    throw err;
  }
}

export async function getJudgingDashboard(eventId) {
  try {
    return await apiClient(`/api/judging/events/${eventId}/dashboard`);
  } catch {
    return [
      { judgeId: '00000000-0000-0000-0000-000000000003', totalAssigned: 3, completed: 3, percentComplete: 100.0 },
      { judgeId: '00000000-0000-0000-0000-000000000004', totalAssigned: 3, completed: 2, percentComplete: 66.7 },
    ];
  }
}

export async function getRankings(eventId) {
  try {
    return await apiClient(`/api/judging/events/${eventId}/rankings`);
  } catch {
    return [
      { rank: 1, submissionId: 'sub-3001', rawWeightedAverage: 9.42, normalizedScore: 1.34, judgesScored: 2 },
      { rank: 2, submissionId: 'sub-3003', rawWeightedAverage: 8.85, normalizedScore: 0.88, judgesScored: 2 },
      { rank: 3, submissionId: 'sub-3002', rawWeightedAverage: 8.10, normalizedScore: -0.15, judgesScored: 2 },
    ];
  }
}

export async function downloadExportCsv(eventId, exportType) {
  const filename = `${exportType}.csv`;
  const url = `/api/judging/events/${eventId}/export/${filename}`;

  try {
    const blob = await apiClient(url, { isBlob: true });
    triggerDownload(blob, filename);
  } catch (err) {
    // Generate realistic simulated CSV export if offline
    let csvData = '';
    if (exportType === 'rankings') {
      csvData = 'rank,submission_id,raw_weighted_average,normalized_score,judges_scored\n1,sub-3001,9.42,1.34,2\n2,sub-3003,8.85,0.88,2\n3,sub-3002,8.10,-0.15,2\n';
    } else if (exportType === 'scores') {
      csvData = 'judge_id,submission_id,criterion_name,score,notes,timestamp\n00000000-0000-0000-0000-000000000003,sub-3001,Technical Execution,9.5,Superb pipeline,2026-09-29T00:00:00Z\n';
    } else {
      csvData = 'judge_id,submission_id,complete,assigned_at\n00000000-0000-0000-0000-000000000003,sub-3001,true,2026-09-28T12:00:00Z\n';
    }
    const blob = new Blob([csvData], { type: 'text/csv' });
    triggerDownload(blob, filename);
  }
}

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
