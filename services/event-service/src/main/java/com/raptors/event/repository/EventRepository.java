package com.raptors.event.repository;

import com.raptors.event.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findByStatusIn(List<Event.EventStatus> statuses);
}
