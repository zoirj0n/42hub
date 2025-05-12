
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "@/contexts/EventContext";
import { Event } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, ArrowLeft, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import EventRegistration from "@/components/events/EventRegistration";
import { useAuth } from "@/contexts/AuthContext";
import EventTagList from "@/components/events/EventTagList";
import EventLocation from "@/components/events/EventLocation";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getEventById } = useEvents();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id);
      if (eventData) {
        setEvent(eventData);
      } else {
        navigate("/404", { replace: true });
      }
    }
  }, [id, getEventById, navigate]);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Badge>{event.category}</Badge>
              <span className="text-muted-foreground text-sm">
                <Clock className="inline-block mr-1 h-4 w-4" />
                {format(new Date(event.date), 'PPP')} at {format(new Date(event.date), 'p')}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold">{event.title}</h1>
          </div>
          
          {(event.imageUrl || event.image) && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={event.imageUrl || event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">About this event</h2>
              <div className="prose max-w-none">
                <p>{event.description}</p>
              </div>
            </div>
            
            <EventTagList tags={event.tags || []} />
          </div>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Date and Time</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    <br />
                    {format(new Date(event.date), 'p')}
                  </p>
                </div>
              </div>
              
              <EventLocation location={event.location} />
              
              <div className="pt-4 border-t">
                {isAuthenticated ? (
                  <EventRegistration 
                    eventId={event.id} 
                    className="w-full"
                  />
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Sign in to register
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
