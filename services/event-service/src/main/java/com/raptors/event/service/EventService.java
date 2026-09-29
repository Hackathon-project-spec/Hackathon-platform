package com.raptors.event.service;

import com.raptors.event.domain.Event;
import com.raptors.event.domain.Prize;
import com.raptors.event.domain.Track;
import com.raptors.event.dto.EventDtos.*;
import com.raptors.event.event.EventEvents;
import com.raptors.event.repository.EventRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public EventService(EventRepository repository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Transactional
    public Event create(UUID organizerId, CreateEventRequest req) {
        Event event = new Event(req.name(), req.description(), organizerId,
                req.registrationOpensAt(), req.registrationClosesAt(),
                req.hackingStartsAt(), req.submissionDeadline(), req.maxTeamSize());
        Event saved = repository.save(event);
        kafkaTemplate.send(EventEvents.EVENT_CREATED, saved.getId().toString(),
                EventEvents.EventCreated.now(saved.getId(), saved.getName(), organizerId, saved.getSubmissionDeadline(),
                        saved.getRegistrationClosesAt(), saved.getMaxTeamSize()));
        return saved;
    }

    public Event get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Event not found: " + id));
    }

    public List<Event> listPublic() {
        return repository.findByStatusIn(List.of(Event.EventStatus.PUBLISHED, Event.EventStatus.LIVE,
                Event.EventStatus.JUDGING, Event.EventStatus.COMPLETED));
    }

    public List<Event> listAll() {
        return repository.findAll();
    }

    @Transactional
    public Event updateTimeline(UUID id, UpdateTimelineRequest req) {
        Event event = get(id);
        if (req.registrationOpensAt() != null) event.setRegistrationOpensAt(req.registrationOpensAt());
        if (req.registrationClosesAt() != null) event.setRegistrationClosesAt(req.registrationClosesAt());
        if (req.hackingStartsAt() != null) event.setHackingStartsAt(req.hackingStartsAt());
        if (req.submissionDeadline() != null) event.setSubmissionDeadline(req.submissionDeadline());
        if (req.votingOpensAt() != null) event.setVotingOpensAt(req.votingOpensAt());
        if (req.votingClosesAt() != null) event.setVotingClosesAt(req.votingClosesAt());
        if (req.judgingOpensAt() != null) event.setJudgingOpensAt(req.judgingOpensAt());
        if (req.judgingClosesAt() != null) event.setJudgingClosesAt(req.judgingClosesAt());
        if (req.resultsPublishedAt() != null) event.setResultsPublishedAt(req.resultsPublishedAt());
        kafkaTemplate.send(EventEvents.EVENT_UPDATED, id.toString(),
                EventEvents.EventCreated.now(id, event.getName(), event.getOrganizerId(), event.getSubmissionDeadline(),
                        event.getRegistrationClosesAt(), event.getMaxTeamSize()));
        return event;
    }

    @Transactional
    public Event changeStatus(UUID id, Event.EventStatus newStatus) {
        Event event = get(id);
        String prev = event.getStatus().name();
        event.setStatus(newStatus);
        kafkaTemplate.send(EventEvents.EVENT_STATUS_CHANGED, id.toString(),
                EventEvents.EventStatusChanged.now(id, prev, newStatus.name()));
        return event;
    }

    @Transactional
    public Track addTrack(UUID eventId, CreateTrackRequest req) {
        Event event = get(eventId);
        Track track = new Track(event, req.name(), req.description());
        event.getTracks().add(track);
        return track;
    }

    @Transactional
    public Prize addPrize(UUID eventId, CreatePrizeRequest req) {
        Event event = get(eventId);
        Prize prize = new Prize(event, req.title(), req.description(), req.trackId(), req.rank());
        event.getPrizes().add(prize);
        return prize;
    }
}
