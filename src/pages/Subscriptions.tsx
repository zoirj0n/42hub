
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Heart, Trash2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useEvents } from "@/contexts/EventContext";
import { Event } from "@/types/event";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Subscriptions = () => {
  const { isAuthenticated } = useAuth();
  const { events } = useEvents();
  const { getSubscribedEventIds, getFavoriteEventIds, unsubscribe, unfavorite } = useSubscription();
  const [activeTab, setActiveTab] = useState("subscribed");
  
  // Get IDs of subscribed and favorited events
  const subscribedIds = getSubscribedEventIds();
  const favoriteIds = getFavoriteEventIds();
  
  // Filter events based on subscription/favorite status
  const subscribedEvents = events.filter(event => subscribedIds.includes(event.id));
  const favoriteEvents = events.filter(event => favoriteIds.includes(event.id));
  
  if (!isAuthenticated) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">Please login to view your subscriptions and favorites</p>
        <Button asChild>
          <Link to="/auth">Login / Register</Link>
        </Button>
      </div>
    );
  }
  
  const handleUnsubscribe = (eventId: string) => {
    unsubscribe(eventId);
    toast({
      title: "Unsubscribed",
      description: "You have been unsubscribed from this event",
    });
  };
  
  const handleUnfavorite = (eventId: string) => {
    unfavorite(eventId);
    toast({
      title: "Removed from favorites",
      description: "Event has been removed from your favorites",
    });
  };
  
  const renderEventCard = (event: Event, showActions: boolean = true, actionType: 'subscription' | 'favorite' = 'subscription') => (
    <Card key={event.id} className="overflow-hidden">
      <div className="relative">
        {(event.imageUrl || event.image) && (
          <img
            src={event.imageUrl || event.image}
            alt={event.title}
            className="h-48 w-full object-cover"
          />
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-1">{event.location}</CardDescription>
          </div>
          <Badge variant="secondary">{event.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock className="mr-1 h-4 w-4" />
          {format(parseISO(event.date), "PPP p")}
        </div>
        <p className="line-clamp-2 text-sm">{event.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
        {showActions && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => actionType === 'subscription' ? handleUnsubscribe(event.id) : handleUnfavorite(event.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscribed" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Subscribed
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscribed" className="mt-6">
          {subscribedEvents.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No subscriptions yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Subscribe to events to receive notifications and reminders
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subscribedEvents.map(event => renderEventCard(event, true, 'subscription'))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          {favoriteEvents.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Heart className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No favorite events yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Save your favorite events for quick access
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteEvents.map(event => renderEventCard(event, true, 'favorite'))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subscriptions;
