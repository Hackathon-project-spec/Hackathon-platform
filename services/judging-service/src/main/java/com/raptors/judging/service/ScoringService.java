package com.raptors.judging.service;

import com.raptors.judging.domain.JudgeAssignment;
import com.raptors.judging.domain.Rubric;
import com.raptors.judging.domain.RubricCriterion;
import com.raptors.judging.domain.Score;
import com.raptors.judging.repository.JudgeAssignmentRepository;
import com.raptors.judging.repository.RubricRepository;
import com.raptors.judging.repository.ScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ScoringService {

    private final ScoreRepository scoreRepository;
    private final JudgeAssignmentRepository assignmentRepository;
    private final RubricRepository rubricRepository;

    public ScoringService(ScoreRepository scoreRepository, JudgeAssignmentRepository assignmentRepository,
                           RubricRepository rubricRepository) {
        this.scoreRepository = scoreRepository;
        this.assignmentRepository = assignmentRepository;
        this.rubricRepository = rubricRepository;
    }

    /**
     * Submits (or overwrites) one judge's full set of per-criterion scores for
     * one submission, validates each value is within the criterion's configured
     * range, and marks the underlying assignment complete.
     */
    @Transactional
    public void submitScores(UUID eventId, UUID judgeId, UUID submissionId, Map<UUID, Double> criterionValues, Map<UUID, String> notes) {
        JudgeAssignment assignment = assignmentRepository.findByEventIdAndJudgeIdAndSubmissionId(eventId, judgeId, submissionId)
                .orElseThrow(() -> new SecurityException("You are not assigned to judge this submission"));

        Rubric rubric = rubricRepository.findByEventIdAndActiveTrue(eventId)
                .orElseThrow(() -> new NoSuchElementException("No active rubric configured for this event"));

        for (RubricCriterion criterion : rubric.getCriteria()) {
            Double value = criterionValues.get(criterion.getId());
            if (value == null) {
                throw new IllegalArgumentException("Missing score for criterion: " + criterion.getName());
            }
            if (value < criterion.getMinScore() || value > criterion.getMaxScore()) {
                throw new IllegalArgumentException(String.format(
                        "Score for '%s' must be between %.1f and %.1f", criterion.getName(), criterion.getMinScore(), criterion.getMaxScore()));
            }
            Score score = scoreRepository.findByJudgeIdAndSubmissionIdAndCriterionId(judgeId, submissionId, criterion.getId())
                    .orElse(new Score(eventId, judgeId, submissionId, criterion.getId(), value, notes.get(criterion.getId())));
            score.setValue(value);
            score.setNotes(notes.get(criterion.getId()));
            scoreRepository.save(score);
        }

        assignment.markComplete();
    }

    public List<Score> scoresFor(UUID eventId, UUID judgeId, UUID submissionId) {
        return scoreRepository.findByEventIdAndJudgeIdAndSubmissionId(eventId, judgeId, submissionId);
    }
}
