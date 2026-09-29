package com.raptors.judging.controller;

import com.raptors.judging.dto.JudgingDtos.*;
import com.raptors.judging.service.RubricService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rubrics")
public class RubricController {

    private final RubricService service;

    public RubricController(RubricService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public RubricResponse create(@Valid @RequestBody CreateRubricRequest req) {
        var rubric = service.create(req.eventId(), req.name(),
                req.criteria().stream().map(CriterionRequest::toInput).toList(), req.activate());
        return RubricResponse.from(rubric);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN','JUDGE')")
    public List<RubricResponse> byEvent(@RequestParam UUID eventId) {
        return service.byEvent(eventId).stream().map(RubricResponse::from).toList();
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN','JUDGE')")
    public RubricResponse active(@RequestParam UUID eventId) {
        return RubricResponse.from(service.activeFor(eventId));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public RubricResponse activate(@PathVariable UUID id) {
        return RubricResponse.from(service.activate(id));
    }
}
