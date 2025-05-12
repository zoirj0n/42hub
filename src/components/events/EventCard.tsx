
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import EventDateTime from "./EventDateTime";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Bell, MapPin } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { isAuthenticated } = useAuth();
  const { isSubscribed, isFavorite, toggleSubscription, toggleFavorite } = useSubscription(event.id);

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to events",
      });
      return;
    }
    
    toggleSubscription();
  };
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to favorite events",
      });
      return;
    }
    
    toggleFavorite();
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg group">
      <div className="relative">
        {(event.imageUrl || event.image) ? (
          <div className="aspect-[3/2] w-full overflow-hidden">
            <img
              src={event.imageUrl || event.image}
              alt={event.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-[3/2] w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            <span className="sr-only">Add to favorites</span>
          </Button>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleSubscribe}
          >
            <Bell className={`h-4 w-4 ${isSubscribed ? "fill-primary text-primary" : ""}`} />
            <span className="sr-only">Subscribe to event</span>
          </Button>
        </div>

        <Badge
          className="absolute top-2 left-2"
          variant="secondary"
        >
          {event.category}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-xl">{event.title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          {event.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        {event.tags && event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <EventDateTime date={event.date} className="text-xs" />
        <Link 
          to={`/events/${event.id}`}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3 py-2"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
