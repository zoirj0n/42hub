
import { createContext, useContext, useEffect, useState } from "react";
import { Event } from "@/types/event";
import { useEventActions } from "@/hooks/useEventActions";
import { useEventImportExport } from "@/hooks/useEventImportExport";

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  filterEvents: (query: string) => Event[];
  importEvents: (csvData: string) => Promise<void>;
  exportEventsCSV: () => void;
  exportEventsCalendar: () => void;
}

// Sample event data
const initialEvents: Event[] = [
  {
    id: "1",
    title: "Web Development Workshop",
    description: "Learn the basics of web development with HTML, CSS, and JavaScript.",
    date: "2025-06-15T14:00:00.000Z",
    location: "Online Zoom Meeting",
    category: "Workshop",
    imageUrl: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&auto=format&fit=crop",
    tags: ["web", "coding", "beginner"],
    status: 'upcoming',
    registrationRequired: true,
    organizerId: '1',
    createdAt: "2025-05-01T00:00:00.000Z",
    updatedAt: "2025-05-01T00:00:00.000Z"
  },
  {
    id: "2",
    title: "Summer Tech Conference",
    description: "Annual technology conference featuring speakers from top tech companies.",
    date: "2025-07-20T09:00:00.000Z",
    location: "Tech Hub, San Francisco",
    category: "Conference",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    tags: ["conference", "networking", "tech"],
    status: 'upcoming',
    registrationRequired: true,
    organizerId: '1',
    createdAt: "2025-05-01T00:00:00.000Z",
    updatedAt: "2025-05-01T00:00:00.000Z"
  },
  {
    id: "3",
    title: "AI and Machine Learning Hackathon",
    description: "Build innovative solutions using AI and machine learning technologies.",
    date: "2025-08-05T10:30:00.000Z",
    location: "Innovation Center, New York",
    category: "Hackathon",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop",
    tags: ["AI", "ML", "hackathon"],
    status: 'upcoming',
    registrationRequired: true,
    organizerId: '1',
    createdAt: "2025-05-01T00:00:00.000Z",
    updatedAt: "2025-05-01T00:00:00.000Z"
  },
  {
    id: "4",
    title: "UI/UX Design Workshop",
    description: "Master the principles of user interface and user experience design.",
    date: "2025-09-10T15:00:00.000Z",
    location: "Design Studio, London",
    category: "Workshop",
    imageUrl: "https://images.unsplash.com/photo-1603969409447-ba86143a03f6?w=800&auto=format&fit=crop",
    tags: ["design", "UI", "UX"],
    status: 'upcoming',
    registrationRequired: true,
    organizerId: '1',
    createdAt: "2025-05-01T00:00:00.000Z",
    updatedAt: "2025-05-01T00:00:00.000Z"
  }
];

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents ? JSON.parse(savedEvents) : initialEvents;
  });

  // Get custom hooks
  const { addEvent, updateEvent, deleteEvent, getEventById, filterEvents } = useEventActions(events, setEvents);
  const { importEvents, exportEventsCSV, exportEventsCalendar } = useEventImportExport(events, setEvents);

  // Setup localStorage persistence
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
    
    // Setup BroadcastChannel for cross-tab sync
    const broadcastChannel = new BroadcastChannel('events_sync_channel');
    
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'EVENTS_UPDATED') {
        setEvents(event.data.events);
      }
    };
    
    return () => {
      broadcastChannel.close();
    };
  }, [events]);

  return (
    <EventContext.Provider 
      value={{ 
        events, 
        addEvent, 
        updateEvent, 
        deleteEvent,
        getEventById,
        filterEvents,
        importEvents,
        exportEventsCSV,
        exportEventsCalendar
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};
