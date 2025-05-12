
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { createEvents } from "ics";
import { Event } from "@/types/event";

export const useEventImportExport = (events: Event[], setEvents: React.Dispatch<React.SetStateAction<Event[]>>) => {
  // Function to broadcast events to other tabs
  const broadcastEvents = (updatedEvents: Event[]) => {
    const channel = new BroadcastChannel('events_sync_channel');
    channel.postMessage({
      type: 'EVENTS_UPDATED',
      events: updatedEvents
    });
    channel.close();
  };

  const importEvents = async (csvData: string) => {
    try {
      return new Promise<void>((resolve, reject) => {
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            try {
              const currentTimestamp = new Date().toISOString();
              const newEvents = results.data
                .filter((item: any) => item.title && item.date) // Basic validation
                .map((item: any) => ({
                  id: uuidv4(),
                  title: item.title,
                  description: item.description || '',
                  date: item.date,
                  location: item.location || '',
                  category: item.category || 'Uncategorized',
                  imageUrl: item.imageUrl || undefined,
                  image: item.image || undefined,
                  tags: item.tags ? item.tags.split(',').map((tag: string) => tag.trim()) : [],
                  status: 'upcoming',
                  registrationRequired: item.registrationRequired === 'true' || false,
                  organizerId: '1', // Default organizer
                  createdAt: currentTimestamp,
                  updatedAt: currentTimestamp
                }));
              
              const updatedEvents = [...events, ...newEvents];
              setEvents(updatedEvents);
              broadcastEvents(updatedEvents);
              
              toast({
                title: "Import Successful",
                description: `Imported ${newEvents.length} events.`,
              });
              
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error("Error importing events:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing events. Please check your CSV file.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const exportEventsCSV = () => {
    try {
      const csvData = events.map(event => ({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        category: event.category,
        imageUrl: event.imageUrl || '',
        image: event.image || '',
        tags: event.tags ? event.tags.join(', ') : '',
        status: event.status,
        registrationRequired: event.registrationRequired,
        organizerId: event.organizerId,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }));
      
      // Creating a link element programmatically
      const element = document.createElement('a');
      const headers = Object.keys(csvData[0]);
      
      let csvContent = headers.join(',') + '\n';
      csvData.forEach(row => {
        const values = headers.map(header => {
          const cell = row[header as keyof typeof row] || '';
          // Escape quotes and wrap in quotes
          return `"${String(cell).replace(/"/g, '""')}"`;
        });
        csvContent += values.join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      element.setAttribute('href', url);
      element.setAttribute('download', `events_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      element.style.display = 'none';
      
      document.body.appendChild(element);
      element.click();
      
      document.body.removeChild(element);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "CSV Export Successful",
        description: `${events.length} events exported to CSV.`,
      });
    } catch (error) {
      console.error("Error exporting events to CSV:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting events to CSV.",
        variant: "destructive",
      });
    }
  };

  const exportEventsCalendar = () => {
    try {
      const icsEvents = events.map(event => {
        // Parse the date string to create appropriate date arrays for ics
        const eventDate = new Date(event.date);
        const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
        
        // ICS requires properly formatted date arrays [year, month, day, hour, minute]
        return {
          title: event.title,
          description: event.description,
          start: [
            eventDate.getFullYear(),
            eventDate.getMonth() + 1, // Months are 0-indexed in JS, but 1-indexed in ics
            eventDate.getDate(),
            eventDate.getHours(),
            eventDate.getMinutes()
          ] as [number, number, number, number, number], // Explicit type cast to match ICS requirements
          end: [
            endDate.getFullYear(),
            endDate.getMonth() + 1,
            endDate.getDate(),
            endDate.getHours(),
            endDate.getMinutes()
          ] as [number, number, number, number, number], // Explicit type cast to match ICS requirements
          location: event.location,
          categories: [event.category],
        };
      });
      
      createEvents(icsEvents, (error: Error | null, value: string) => {
        if (error) {
          throw error;
        }
        
        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `events_calendar_${format(new Date(), 'yyyy-MM-dd')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Calendar Export Successful",
          description: `${events.length} events exported to iCalendar format.`,
        });
      });
    } catch (error) {
      console.error("Error exporting events to calendar:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting events to calendar format.",
        variant: "destructive",
      });
    }
  };

  return {
    importEvents,
    exportEventsCSV,
    exportEventsCalendar
  };
};

// Helper function to generate UUID
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
