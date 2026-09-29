package com.raptors.judging.service;

import com.raptors.judging.domain.Rubric;
import com.raptors.judging.domain.RubricCriterion;
import com.raptors.judging.domain.Score;
import com.raptors.judging.repository.RubricRepository;
import com.raptors.judging.repository.ScoreRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Cross-judge score normalization.
 *
 * Problem: judges differ in how harshly or generously they score, and in how
 * much they spread their scores out. A raw average across judges rewards
 * submissions lucky enough to draw lenient judges rather than the submissions
 * that were actually best.
 *
 * Approach: per-judge z-score standardization.
 *   1. For each judge, compute their weighted total score per submission they scored.
 *   2. Compute that judge's mean (mu_j) and population stdev (sigma_j) across all
 *      the submissions they scored this event.
 *   3. Convert each of that judge's raw totals to a z-score: z = (raw - mu_j) / sigma_j.
 *      A z-score of 0 means "this judge's average opinion"; +1 means "one of that
 *      judge's own standard deviations above their average".
 *   4. A submission's normalized score = the mean of the z-scores it received
 *      across all judges who scored it.
 *
 * This removes each judge's personal severity/leniency and personal spread as
 * confounders, while still letting a judge's *relative* ranking of the
 * submissions they saw count fully. If a judge gave every submission the same
 * score (sigma_j = 0), their z-scores are defined as 0 for all of them — they
 * contributed no discriminating signal, which is the correct treatment rather
 * than a division-by-zero crash or an arbitrary tie-break.
 *
 * Documented trade-off (see JUDGING.md): this assumes each judge saw enough
 * submissions (ideally 5+) for mu/sigma to be meaningful; with very few
 * submissions per judge, z-scores are noisy — the raw average is shown
 * alongside the normalized score for exactly this reason.
 */
@Service
public class NormalizationService {

    private final ScoreRepository scoreRepository;
    private final RubricRepository rubricRepository;

    public NormalizationService(ScoreRepository scoreRepository, RubricRepository rubricRepository) {
        this.scoreRepository = scoreRepository;
        this.rubricRepository = rubricRepository;
    }

    public record SubmissionResult(UUID submissionId, double rawWeightedAverage, double normalizedScore, int judgeCount) {}

    public List<SubmissionResult> rankEvent(UUID eventId) {
        Rubric rubric = rubricRepository.findByEventIdAndActiveTrue(eventId).orElse(null);
        if (rubric == null) return List.of();

        Map<UUID, Double> weightByCriterion = new HashMap<>();
        double totalWeight = rubric.getCriteria().stream().mapToDouble(RubricCriterion::getWeight).sum();
        for (RubricCriterion c : rubric.getCriteria()) {
            weightByCriterion.put(c.getId(), totalWeight > 0 ? c.getWeight() / totalWeight : 0);
        }

        List<Score> allScores = scoreRepository.findByEventId(eventId);

        // weighted total per (judge, submission)
        Map<UUID, Map<UUID, Double>> perJudgeSubmissionTotal = new HashMap<>();
        for (Score s : allScores) {
            double w = weightByCriterion.getOrDefault(s.getCriterionId(), 0.0);
            perJudgeSubmissionTotal
                    .computeIfAbsent(s.getJudgeId(), k -> new HashMap<>())
                    .merge(s.getSubmissionId(), s.getValue() * w, Double::sum);
        }

        // per-judge mean/stdev across the submissions that judge scored
        Map<UUID, double[]> judgeStats = new HashMap<>(); // [mean, stdev]
        for (var entry : perJudgeSubmissionTotal.entrySet()) {
            Collection<Double> totals = entry.getValue().values();
            double mean = totals.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double variance = totals.stream().mapToDouble(t -> Math.pow(t - mean, 2)).average().orElse(0);
            double stdev = Math.sqrt(variance);
            judgeStats.put(entry.getKey(), new double[]{mean, stdev});
        }

        // z-score per (judge, submission), aggregated per submission
        Map<UUID, List<Double>> submissionZScores = new HashMap<>();
        Map<UUID, List<Double>> submissionRawTotals = new HashMap<>();
        for (var judgeEntry : perJudgeSubmissionTotal.entrySet()) {
            UUID judgeId = judgeEntry.getKey();
            double[] stats = judgeStats.get(judgeId);
            double mean = stats[0], stdev = stats[1];
            for (var subEntry : judgeEntry.getValue().entrySet()) {
                double raw = subEntry.getValue();
                double z = stdev > 1e-9 ? (raw - mean) / stdev : 0.0;
                submissionZScores.computeIfAbsent(subEntry.getKey(), k -> new ArrayList<>()).add(z);
                submissionRawTotals.computeIfAbsent(subEntry.getKey(), k -> new ArrayList<>()).add(raw);
            }
        }

        List<SubmissionResult> results = new ArrayList<>();
        for (UUID submissionId : submissionZScores.keySet()) {
            List<Double> zScores = submissionZScores.get(submissionId);
            List<Double> raws = submissionRawTotals.get(submissionId);
            double avgZ = zScores.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double avgRaw = raws.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            results.add(new SubmissionResult(submissionId, avgRaw, avgZ, zScores.size()));
        }

        results.sort((a, b) -> Double.compare(b.normalizedScore(), a.normalizedScore()));
        return results;
    }
}
