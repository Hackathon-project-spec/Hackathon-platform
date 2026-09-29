package com.raptors.judging.service;

import com.raptors.judging.domain.JudgeAssignment;
import com.raptors.judging.domain.SubmissionCache;
import com.raptors.judging.repository.JudgeAssignmentRepository;
import com.raptors.judging.repository.SubmissionCacheRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Batch/algorithmic judge assignment.
 *
 * Goal: every finalized submission gets exactly {@code reviewsPerSubmission}
 * distinct judges, and judge workload stays as even as possible.
 *
 * Approach: greedy load balancing. Submissions are shuffled (so assignment
 * order doesn't systematically favor early- or late-numbered submissions),
 * then for each submission we pick the N least-loaded judges who are not
 * already assigned to it. This is O(submissions * judges * log judges) and
 * is easy to explain and audit — a property this project weighs over a
 * marginally-more-optimal but opaque assignment (see JUDGING.md).
 */
@Service
public class AssignmentService {

    private final JudgeAssignmentRepository assignmentRepository;
    private final SubmissionCacheRepository submissionCacheRepository;

    public AssignmentService(JudgeAssignmentRepository assignmentRepository,
                              SubmissionCacheRepository submissionCacheRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionCacheRepository = submissionCacheRepository;
    }

    @Transactional
    public List<JudgeAssignment> assignBatch(UUID eventId, List<UUID> judgeIds, int reviewsPerSubmission) {
        if (judgeIds.isEmpty()) {
            throw new IllegalArgumentException("At least one judge is required");
        }
        List<SubmissionCache> submissions = new ArrayList<>(submissionCacheRepository.findByEventId(eventId));
        if (submissions.isEmpty()) {
            throw new IllegalStateException("No finalized submissions to assign for this event yet");
        }
        int k = Math.min(reviewsPerSubmission, judgeIds.size());

        Collections.shuffle(submissions, new Random(eventId.hashCode()));

        // current load per judge, seeded from any pre-existing assignments so
        // re-running the batch (e.g. after adding late submissions) stays balanced
        Map<UUID, Integer> load = new HashMap<>();
        for (UUID j : judgeIds) load.put(j, 0);
        for (JudgeAssignment existing : assignmentRepository.findByEventId(eventId)) {
            load.merge(existing.getJudgeId(), 1, Integer::sum);
        }

        List<JudgeAssignment> created = new ArrayList<>();

        for (SubmissionCache submission : submissions) {
            Set<UUID> alreadyAssigned = new HashSet<>();
            for (JudgeAssignment existing : assignmentRepository.findBySubmissionId(submission.getSubmissionId())) {
                alreadyAssigned.add(existing.getJudgeId());
            }
            long needed = k - alreadyAssigned.size();
            if (needed <= 0) continue;

            List<UUID> candidates = new ArrayList<>(judgeIds);
            candidates.removeAll(alreadyAssigned);
            candidates.sort(Comparator.comparingInt(load::get));

            for (int i = 0; i < needed && i < candidates.size(); i++) {
                UUID judgeId = candidates.get(i);
                JudgeAssignment assignment = new JudgeAssignment(eventId, judgeId, submission.getSubmissionId());
                assignmentRepository.save(assignment);
                created.add(assignment);
                load.merge(judgeId, 1, Integer::sum);
            }
        }
        return created;
    }

    public List<JudgeAssignment> forJudge(UUID eventId, UUID judgeId) {
        return assignmentRepository.findByEventIdAndJudgeId(eventId, judgeId);
    }

    public List<JudgeAssignment> forEvent(UUID eventId) {
        return assignmentRepository.findByEventId(eventId);
    }
}
