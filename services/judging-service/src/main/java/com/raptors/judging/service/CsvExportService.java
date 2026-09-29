package com.raptors.judging.service;

import com.raptors.judging.domain.JudgeAssignment;
import com.raptors.judging.domain.Rubric;
import com.raptors.judging.domain.Score;
import com.raptors.judging.domain.SubmissionCache;
import com.raptors.judging.repository.JudgeAssignmentRepository;
import com.raptors.judging.repository.RubricRepository;
import com.raptors.judging.repository.ScoreRepository;
import com.raptors.judging.repository.SubmissionCacheRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CsvExportService {

    private final JudgeAssignmentRepository assignmentRepository;
    private final ScoreRepository scoreRepository;
    private final SubmissionCacheRepository submissionCacheRepository;
    private final RubricRepository rubricRepository;
    private final NormalizationService normalizationService;

    public CsvExportService(JudgeAssignmentRepository assignmentRepository, ScoreRepository scoreRepository,
                             SubmissionCacheRepository submissionCacheRepository, RubricRepository rubricRepository,
                             NormalizationService normalizationService) {
        this.assignmentRepository = assignmentRepository;
        this.scoreRepository = scoreRepository;
        this.submissionCacheRepository = submissionCacheRepository;
        this.rubricRepository = rubricRepository;
        this.normalizationService = normalizationService;
    }

    public String assignmentsCsv(UUID eventId) {
        StringBuilder sb = new StringBuilder("assignment_id,judge_id,submission_id,submission_title,assigned_at,completed_at\n");
        Map<UUID, String> titles = titleLookup(eventId);
        for (JudgeAssignment a : assignmentRepository.findByEventId(eventId)) {
            sb.append(csvRow(
                    a.getId().toString(), a.getJudgeId().toString(), a.getSubmissionId().toString(),
                    titles.getOrDefault(a.getSubmissionId(), ""),
                    String.valueOf(a.getAssignedAt()),
                    a.getCompletedAt() == null ? "" : a.getCompletedAt().toString()
            ));
        }
        return sb.toString();
    }

    public String scoresCsv(UUID eventId) {
        Rubric rubric = rubricRepository.findByEventIdAndActiveTrue(eventId).orElse(null);
        Map<UUID, String> criterionNames = rubric == null ? Map.of() :
                rubric.getCriteria().stream().collect(Collectors.toMap(c -> c.getId(), c -> c.getName()));
        Map<UUID, String> titles = titleLookup(eventId);

        StringBuilder sb = new StringBuilder("judge_id,submission_id,submission_title,criterion,value,notes,scored_at\n");
        for (Score s : scoreRepository.findByEventId(eventId)) {
            sb.append(csvRow(
                    s.getJudgeId().toString(), s.getSubmissionId().toString(),
                    titles.getOrDefault(s.getSubmissionId(), ""),
                    criterionNames.getOrDefault(s.getCriterionId(), s.getCriterionId().toString()),
                    String.valueOf(s.getValue()),
                    s.getNotes() == null ? "" : s.getNotes(),
                    String.valueOf(s.getScoredAt())
            ));
        }
        return sb.toString();
    }

    public String rankingsCsv(UUID eventId) {
        Map<UUID, String> titles = titleLookup(eventId);
        List<NormalizationService.SubmissionResult> ranked = normalizationService.rankEvent(eventId);

        StringBuilder sb = new StringBuilder("rank,submission_id,submission_title,raw_weighted_average,normalized_score,judges_scored\n");
        int rank = 1;
        for (var r : ranked) {
            sb.append(csvRow(
                    String.valueOf(rank++), r.submissionId().toString(), titles.getOrDefault(r.submissionId(), ""),
                    String.format("%.3f", r.rawWeightedAverage()), String.format("%.3f", r.normalizedScore()),
                    String.valueOf(r.judgeCount())
            ));
        }
        return sb.toString();
    }

    private Map<UUID, String> titleLookup(UUID eventId) {
        return submissionCacheRepository.findByEventId(eventId).stream()
                .collect(Collectors.toMap(SubmissionCache::getSubmissionId, s -> s.getTitle() == null ? "" : s.getTitle()));
    }

    private String csvRow(String... fields) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < fields.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(escape(fields[i]));
        }
        return sb.append('\n').toString();
    }

    private String escape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
