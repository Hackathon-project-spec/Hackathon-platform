package com.raptors.judging.controller;

import com.raptors.judging.config.CurrentUser;
import com.raptors.judging.domain.JudgeAssignment;
import com.raptors.judging.dto.JudgingDtos.*;
import com.raptors.judging.repository.JudgeAssignmentRepository;
import com.raptors.judging.service.AssignmentService;
import com.raptors.judging.service.CsvExportService;
import com.raptors.judging.service.NormalizationService;
import com.raptors.judging.service.ScoringService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/judging")
public class JudgingController {

    private final AssignmentService assignmentService;
    private final ScoringService scoringService;
    private final NormalizationService normalizationService;
    private final CsvExportService csvExportService;
    private final JudgeAssignmentRepository assignmentRepository;

    public JudgingController(AssignmentService assignmentService, ScoringService scoringService,
                              NormalizationService normalizationService, CsvExportService csvExportService,
                              JudgeAssignmentRepository assignmentRepository) {
        this.assignmentService = assignmentService;
        this.scoringService = scoringService;
        this.normalizationService = normalizationService;
        this.csvExportService = csvExportService;
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public List<AssignmentResponse> assignBatch(@Valid @RequestBody AssignBatchRequest req) {
        int reviewsPerSubmission = req.reviewsPerSubmission() > 0 ? req.reviewsPerSubmission() : 3;
        return assignmentService.assignBatch(req.eventId(), req.judgeIds(), reviewsPerSubmission)
                .stream().map(AssignmentResponse::from).toList();
    }

    @GetMapping("/assignments/mine")
    @PreAuthorize("hasRole('JUDGE')")
    public List<AssignmentResponse> myAssignments(@RequestParam UUID eventId) {
        return assignmentService.forJudge(eventId, CurrentUser.id()).stream().map(AssignmentResponse::from).toList();
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public List<AssignmentResponse> allAssignments(@RequestParam UUID eventId) {
        return assignmentService.forEvent(eventId).stream().map(AssignmentResponse::from).toList();
    }

    @PostMapping("/scores")
    @PreAuthorize("hasRole('JUDGE')")
    public void submitScores(@Valid @RequestBody SubmitScoresRequest req) {
        scoringService.submitScores(req.eventId(), CurrentUser.id(), req.submissionId(),
                req.scores(), req.notes() == null ? Map.of() : req.notes());
    }

    /** Organizer-facing progress dashboard: completion rate per judge for an event. */
    @GetMapping("/events/{eventId}/dashboard")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public List<JudgeProgressResponse> dashboard(@PathVariable UUID eventId) {
        List<JudgeAssignment> all = assignmentService.forEvent(eventId);
        Map<UUID, List<JudgeAssignment>> byJudge = all.stream().collect(Collectors.groupingBy(JudgeAssignment::getJudgeId));
        return byJudge.entrySet().stream()
                .map(e -> {
                    int total = e.getValue().size();
                    int done = (int) e.getValue().stream().filter(JudgeAssignment::isComplete).count();
                    return new JudgeProgressResponse(e.getKey(), total, done, total == 0 ? 0 : (100.0 * done / total));
                })
                .toList();
    }

    @GetMapping("/events/{eventId}/rankings")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN','JUDGE')")
    public List<RankingResponse> rankings(@PathVariable UUID eventId) {
        return RankingResponse.fromRanked(normalizationService.rankEvent(eventId));
    }

    @GetMapping("/events/{eventId}/export/assignments.csv")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public ResponseEntity<String> exportAssignments(@PathVariable UUID eventId) {
        return csv(csvExportService.assignmentsCsv(eventId), "assignments.csv");
    }

    @GetMapping("/events/{eventId}/export/scores.csv")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public ResponseEntity<String> exportScores(@PathVariable UUID eventId) {
        return csv(csvExportService.scoresCsv(eventId), "scores.csv");
    }

    @GetMapping("/events/{eventId}/export/rankings.csv")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public ResponseEntity<String> exportRankings(@PathVariable UUID eventId) {
        return csv(csvExportService.rankingsCsv(eventId), "rankings.csv");
    }

    private ResponseEntity<String> csv(String body, String filename) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(body);
    }
}
