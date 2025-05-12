
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "@/contexts/EventContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CalendarIcon, Filter } from "lucide-react";
import { addMonths, subMonths, addYears, subYears, startOfMonth, endOfMonth, isSameDay, format, isWithinInterval, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { DateTimePicker } from "@/components/events/DateTimePicker";
import { Slider } from "@/components/ui/slider";
import EventDateTime from "@/components/events/EventDateTime";

const CalendarView = () => {
  const { events } = useEvents();
  const [date, setDate] = useState(new Date());
  const [range, setRange] = useState<number>(10); // Default range in km
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [showEvents, setShowEvents] = useState<string[]>([]);
  const [yearView, setYearView] = useState(true);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  // Find events for the current date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => {
      try {
        return isSameDay(new Date(event.date), date);
      } catch (e) {
        console.error("Invalid date format for event:", event.id, e);
        return false;
      }
    });
  };

  // For yearly view, we need to structure events by month
  const getEventsByMonth = () => {
    const eventsByMonth: Record<string, number> = {};
    
    filteredEvents.forEach(event => {
      try {
        const eventDate = new Date(event.date);
        if (!isNaN(eventDate.getTime())) {
          const monthKey = format(eventDate, 'yyyy-MM');
          
          if (eventsByMonth[monthKey]) {
            eventsByMonth[monthKey] += 1;
          } else {
            eventsByMonth[monthKey] = 1;
          }
        }
      } catch (e) {
        console.error("Error processing event date:", event.id, e);
      }
    });
    
    return eventsByMonth;
  };

  const eventsByMonth = getEventsByMonth();

  // Filter events for the current date
  const eventsForDate = showEvents.length > 0 
    ? filteredEvents.filter(event => showEvents.includes(event.id))
    : [];

  // Filter events by range and date if specified
  useEffect(() => {
    let filtered = events;
    
    // Filter by date if specified
    if (filterDate) {
      filtered = filtered.filter(event => {
        try {
          const eventDate = new Date(event.date);
          return isSameDay(eventDate, filterDate);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Filter by range
    if (range !== 0) {
      // In a real app, this would filter events based on distance from user
      // For demo purposes, we'll just simulate filtering by taking a subset
      filtered = filtered.filter((_, index) => 
        index % Math.max(1, Math.floor(10 / range)) === 0
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, range, filterDate]);

  // Navigate between months
  const previousMonth = () => {
    setDate(subMonths(date, 1));
  };

  const nextMonth = () => {
    setDate(addMonths(date, 1));
  };

  // Handle date selection
  const handleSelect = (day: Date | undefined) => {
    if (day) {
      try {
        const selectedEvents = getEventsForDate(day).map(e => e.id);
        setShowEvents(selectedEvents);
      } catch (e) {
        console.error("Error handling date selection:", e);
        setShowEvents([]);
      }
    }
  };
  
  // For yearly view 
  const getMonthCalendars = () => {
    const months = [];
    const currentYear = date.getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentYear, month, 1);
      months.push(monthDate);
    }
    
    return months;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Calendar</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setYearView(!yearView)}
          >
            Show {yearView ? "Month" : "Year"} View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side - Calendar (now wider) */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle>
                {yearView ? format(date, 'yyyy') : format(date, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button size="icon" variant="outline" onClick={yearView ? () => setDate(subYears(date, 1)) : previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous {yearView ? 'year' : 'month'}</span>
                </Button>
                <Button size="icon" variant="outline" onClick={yearView ? () => setDate(addYears(date, 1)) : nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next {yearView ? 'year' : 'month'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Filters section */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {/* Date filter */}
                  <div className="flex-1 min-w-[240px]">
                    <Label htmlFor="date-filter" className="mb-2 block">Filter by specific date:</Label>
                    <DateTimePicker 
                      date={filterDate}
                      setDate={setFilterDate}
                    />
                  </div>
                  
                  {/* Range filter with slider */}
                  <div className="flex-1 min-w-[240px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="range-filter">Distance range: {range}km</Label>
                        {range > 0 ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setRange(0)}
                            className="h-8 px-2"
                          >
                            Clear
                          </Button>
                        ) : null}
                      </div>
                      <Slider
                        id="range-filter"
                        value={[range]}
                        min={0}
                        max={50}
                        step={5}
                        onValueChange={(values) => setRange(values[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>All</span>
                        <span>25km</span>
                        <span>50km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year View */}
              {yearView ? (
                <div className="grid grid-cols-3 gap-2">
                  {getMonthCalendars().map((monthDate, index) => (
                    <div key={index} className="border rounded-md p-1">
                      <div className="text-center font-medium text-xs mb-1">
                        {format(monthDate, 'MMM')}
                        {eventsByMonth[format(monthDate, 'yyyy-MM')] && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            {eventsByMonth[format(monthDate, 'yyyy-MM')]}
                          </Badge>
                        )}
                      </div>
                      <Calendar
                        mode="single"
                        selected={undefined}
                        onSelect={(day) => {
                          setDate(day || new Date());
                          setYearView(false);
                          if (day) handleSelect(day);
                        }}
                        month={monthDate}
                        modifiers={{
                          event: (date) => getEventsForDate(date).length > 0,
                        }}
                        modifiersStyles={{
                          event: { 
                            fontWeight: 'bold', 
                            backgroundColor: 'hsl(var(--primary) / 0.3)',
                            color: 'hsl(var(--primary-foreground))',
                            borderRadius: '100%'
                          },
                        }}
                        disabled={false}
                        className="w-full pointer-events-auto"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Month View */
                <Calendar
                  mode="single"
                  selected={showEvents.length > 0 && events.find(e => e.id === showEvents[0])?.date ? 
                    new Date(events.find(e => e.id === showEvents[0])?.date || date) : undefined}
                  onSelect={handleSelect}
                  month={date}
                  modifiers={{
                    event: (date) => getEventsForDate(date).length > 0,
                  }}
                  modifiersStyles={{
                    event: { 
                      fontWeight: 'bold', 
                      backgroundColor: 'hsl(var(--primary) / 0.3)',
                      color: 'hsl(var(--primary-foreground))',
                      borderRadius: '100%'
                    },
                  }}
                  className="pointer-events-auto"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Event Listing (now narrower) */}
        <div className="md:col-span-4">
          {showEvents.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Events for {
                  showEvents.length > 0 && events.find(e => e.id === showEvents[0])?.date ? 
                    format(new Date(events.find(e => e.id === showEvents[0])?.date || date), 'PP') : 
                    format(new Date(), 'PP')
                }</CardTitle>
                <CardDescription>
                  {eventsForDate.length} {eventsForDate.length === 1 ? 'event' : 'events'} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eventsForDate.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="mb-2">
                        <Badge className="mb-1">{event.category}</Badge>
                        <h3 className="text-lg font-medium">{event.title}</h3>
                        <EventDateTime date={event.date} />
                        <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="self-end">
                        <Link to={`/events/${event.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Event List</CardTitle>
                <CardDescription>
                  {filteredEvents.length} total events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center p-4 border rounded-lg bg-muted/20">
                    <p>No events found within the selected range or date.</p>
                  </div>
                ) : (
                  filteredEvents.slice(0, 5).map((event) => (
                    <div 
                      key={event.id} 
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        try {
                          setDate(new Date(event.date));
                          setYearView(false);
                          handleSelect(new Date(event.date));
                        } catch (e) {
                          console.error("Error handling event click:", e);
                        }
                      }}
                    >
                      <div className="flex flex-col">
                        <div className="mb-2">
                          <Badge className="mb-1">{event.category}</Badge>
                          <h3 className="text-lg font-medium">{event.title}</h3>
                          <EventDateTime date={event.date} />
                          <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="self-end mt-2">
                          <Link to={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                {filteredEvents.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link to="/">View All Events</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
