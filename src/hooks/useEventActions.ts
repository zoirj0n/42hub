
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { Event } from "@/types/event";

export const useEventActions = (events: Event[], setEvents: React.Dispatch<React.SetStateAction<Event[]>>) => {
  // Function to broadcast events to other tabs
  const broadcastEvents = (updatedEvents: Event[]) => {
    const channel = new BroadcastChannel('events_sync_channel');
    channel.postMessage({
      type: 'EVENTS_UPDATED',
      events: updatedEvents
    });
    channel.close();
  };

  const addEvent = (eventData: Omit<Event, "id">) => {
    // Process tags if they come as a string
    let processedTags: string[] | undefined = eventData.tags;
    if (typeof eventData.tags === 'string') {
      processedTags = (eventData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }
      
    const newEvent = { 
      ...eventData, 
      id: uuidv4(),
      tags: processedTags
    };
    
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    broadcastEvents(updatedEvents);
    
    toast({
      title: "Event Created",
      description: `"${newEvent.title}" has been added successfully.`,
    });
  };

  const updateEvent = (id: string, updatedData: Partial<Event>) => {
    // Process tags if they come as a string
    const processedData = { ...updatedData };
    if (typeof processedData.tags === 'string') {
      processedData.tags = (processedData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, ...processedData } : event
    );
    setEvents(updatedEvents);
    broadcastEvents(updatedEvents);
    
    toast({
      title: "Event Updated",
      description: `Event has been updated successfully.`,
    });
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    broadcastEvents(updatedEvents);
    
    toast({
      title: "Event Deleted",
      description: "Event has been deleted successfully.",
    });
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  const filterEvents = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return events.filter(
      event => 
        event.title.toLowerCase().includes(lowercaseQuery) || 
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.category.toLowerCase().includes(lowercaseQuery) ||
        event.location.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    filterEvents
  };
};
