package com.raptors.event.controller;

import com.raptors.event.config.CurrentUser;
import com.raptors.event.domain.Event;
import com.raptors.event.dto.EventDtos.*;
import com.raptors.event.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService service;

    public EventController(EventService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public EventResponse create(@Valid @RequestBody CreateEventRequest req) {
        return EventResponse.from(service.create(CurrentUser.id(), req));
    }

    /** Public gallery of published events — no auth required. */
    @GetMapping("/public")
    public List<EventResponse> listPublic() {
        return service.listPublic().stream().map(EventResponse::from).toList();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public List<EventResponse> listAll() {
        return service.listAll().stream().map(EventResponse::from).toList();
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable UUID id) {
        return EventResponse.from(service.get(id));
    }

    @PatchMapping("/{id}/timeline")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public EventResponse updateTimeline(@PathVariable UUID id, @RequestBody UpdateTimelineRequest req) {
        return EventResponse.from(service.updateTimeline(id, req));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public EventResponse changeStatus(@PathVariable UUID id, @RequestParam Event.EventStatus status) {
        return EventResponse.from(service.changeStatus(id, status));
    }

    @PostMapping("/{id}/tracks")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public TrackResponse addTrack(@PathVariable UUID id, @Valid @RequestBody CreateTrackRequest req) {
        return TrackResponse.from(service.addTrack(id, req));
    }

    @PostMapping("/{id}/prizes")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public PrizeResponse addPrize(@PathVariable UUID id, @Valid @RequestBody CreatePrizeRequest req) {
        return PrizeResponse.from(service.addPrize(id, req));
    }

    @GetMapping("/internal/{id}")
    public ResponseEntity<EventResponse> internalGet(@PathVariable UUID id) {
        return ResponseEntity.ok(EventResponse.from(service.get(id)));
    }
}
