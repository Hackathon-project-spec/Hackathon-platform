package com.raptors.judging.service;

import com.raptors.judging.domain.Rubric;
import com.raptors.judging.domain.RubricCriterion;
import com.raptors.judging.domain.Score;
import com.raptors.judging.repository.RubricRepository;
import com.raptors.judging.repository.ScoreRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Verifies the per-judge z-score normalization math described in JUDGING.md
 * against hand-computed expected values, including the "judge gave everyone
 * the same score" (stdev = 0) edge case.
 *
 * Scenario, one rubric criterion with weight 1 (so weighted total == raw value):
 *   Judge A: submission1 = 10, submission2 = 5   -> mean 7.5, stdev 2.5
 *            z(submission1) = +1.0, z(submission2) = -1.0
 *   Judge B: submission1 = 6,  submission2 = 6    -> mean 6, stdev 0 (edge case)
 *            z(submission1) = 0, z(submission2) = 0
 *
 * Expected normalized scores (mean z-score per submission):
 *   submission1: (1.0 + 0) / 2 = 0.5
 *   submission2: (-1.0 + 0) / 2 = -0.5
 * Expected ranking: submission1 first, submission2 second.
 */
class NormalizationServiceTest {

    private final UUID eventId = UUID.randomUUID();
    private final UUID judgeA = UUID.randomUUID();
    private final UUID judgeB = UUID.randomUUID();
    private final UUID submission1 = UUID.randomUUID();
    private final UUID submission2 = UUID.randomUUID();

    @Test
    void normalizesAwayJudgeSeverityAndSpread() throws Exception {
        Rubric rubric = new Rubric(eventId, "Demo Rubric");
        RubricCriterion criterion = new RubricCriterion(rubric, "Overall", "", 1.0, 0, 10);
        UUID criterionId = UUID.randomUUID();
        setId(criterion, criterionId);
        rubric.getCriteria().add(criterion);

        List<Score> scores = List.of(
                new Score(eventId, judgeA, submission1, criterionId, 10, null),
                new Score(eventId, judgeA, submission2, criterionId, 5, null),
                new Score(eventId, judgeB, submission1, criterionId, 6, null),
                new Score(eventId, judgeB, submission2, criterionId, 6, null)
        );

        RubricRepository rubricRepository = mock(RubricRepository.class);
        ScoreRepository scoreRepository = mock(ScoreRepository.class);
        when(rubricRepository.findByEventIdAndActiveTrue(eventId)).thenReturn(Optional.of(rubric));
        when(scoreRepository.findByEventId(eventId)).thenReturn(scores);

        NormalizationService service = new NormalizationService(scoreRepository, rubricRepository);
        List<NormalizationService.SubmissionResult> ranked = service.rankEvent(eventId);

        assertEquals(2, ranked.size());

        var first = ranked.get(0);
        var second = ranked.get(1);

        assertEquals(submission1, first.submissionId(), "submission1 should rank first");
        assertEquals(0.5, first.normalizedScore(), 1e-9);
        assertEquals(submission2, second.submissionId());
        assertEquals(-0.5, second.normalizedScore(), 1e-9);

        // raw weighted averages are the plain (unnormalized) mean across judges
        assertEquals(8.0, first.rawWeightedAverage(), 1e-9);  // (10 + 6) / 2
        assertEquals(5.5, second.rawWeightedAverage(), 1e-9); // (5 + 6) / 2
    }

    @Test
    void judgeWithNoActiveRubricProducesNoRanking() {
        RubricRepository rubricRepository = mock(RubricRepository.class);
        ScoreRepository scoreRepository = mock(ScoreRepository.class);
        when(rubricRepository.findByEventIdAndActiveTrue(eventId)).thenReturn(Optional.empty());

        NormalizationService service = new NormalizationService(scoreRepository, rubricRepository);
        assertTrue(service.rankEvent(eventId).isEmpty());
    }

    /** RubricCriterion's id is normally JPA-generated; set it directly for this pure unit test. */
    private static void setId(RubricCriterion criterion, UUID id) throws Exception {
        Field field = RubricCriterion.class.getDeclaredField("id");
        field.setAccessible(true);
        field.set(criterion, id);
    }
}
