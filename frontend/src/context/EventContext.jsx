import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getEvent, getPublicEvents, DEMO_EVENT_ID, SEEDED_FALLBACK_EVENT } from '../api/events';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [currentEvent, setCurrentEvent] = useState(SEEDED_FALLBACK_EVENT);
  const [eventsList, setEventsList] = useState([SEEDED_FALLBACK_EVENT]);
  const [loading, setLoading] = useState(true);

  const refreshEvent = useCallback(async (eventId = DEMO_EVENT_ID) => {
    setLoading(true);
    try {
      const data = await getEvent(eventId);
      setCurrentEvent(data || SEEDED_FALLBACK_EVENT);
    } catch {
      setCurrentEvent(SEEDED_FALLBACK_EVENT);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const list = await getPublicEvents();
      if (list?.length > 0) {
        setEventsList(list);
        setCurrentEvent(list[0]);
      }
    } catch {
      setEventsList([SEEDED_FALLBACK_EVENT]);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <EventContext.Provider value={{
      currentEvent,
      setCurrentEvent,
      eventsList,
      loading,
      refreshEvent,
      loadEvents,
      tracks: currentEvent?.tracks || [],
      prizes: currentEvent?.prizes || [],
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvent must be used within EventProvider');
  return ctx;
}
