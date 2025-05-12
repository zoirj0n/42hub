
import { useState, useEffect, useRef } from "react";
import { useEvents } from "@/contexts/EventContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { MapPin, Navigation, Locate } from "lucide-react";
import { mapService } from "@/services/MapService";
import { Event } from "@/types/event";

const MapView = () => {
  const { events } = useEvents();
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchDistance, setSearchDistance] = useState<number>(10);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Initialize the map when component mounts
    if (mapRef.current) {
      mapService.initializeMap(mapRef.current);
      mapService.addEventMarkers(events);
    }
    
    // Cleanup function
    return () => {
      mapService.cleanup();
    };
  }, [events]);
  
  // Get user's location
  const getUserLocation = () => {
    setLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoadingLocation(false);
        
        mapService.addUserLocationMarker(latitude, longitude);
        findNearbyEvents(latitude, longitude, searchDistance);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoadingLocation(false);
        alert("Could not get your location. Please check your browser permissions.");
      }
    );
  };
  
  // Find events within specified radius
  const findNearbyEvents = (lat: number, lng: number, radiusKm: number) => {
    // For demo purposes, generate coordinates for events if they don't have them
    const eventsWithDistance = events.map(event => {
      // Generate random coordinates for demo if not present
      const eventLat = event.latitude || (Math.random() * 180 - 90);
      const eventLng = event.longitude || (Math.random() * 360 - 180);
      
      const distance = mapService.calculateDistance(lat, lng, eventLat, eventLng);
      
      return {
        ...event,
        latitude: eventLat,
        longitude: eventLng,
        distance
      } as Event;
    });
    
    // Filter events within radius
    const nearby = eventsWithDistance
      .filter(event => event.distance! <= radiusKm)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    setNearbyEvents(nearby);
  };
  
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const distance = parseInt(e.target.value);
    setSearchDistance(distance);
    
    // Update nearby events if user location is available
    if (userLocation) {
      findNearbyEvents(userLocation.lat, userLocation.lng, distance);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Map</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getUserLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
            ) : (
              <Locate className="h-4 w-4 mr-2" />
            )}
            Find My Location
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
            <div ref={mapRef} className="h-full w-full"></div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="h-5 w-5 mr-2" />
                Location Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="distance">Search radius (km)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="distance"
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={searchDistance}
                    onChange={handleDistanceChange}
                    className="w-full"
                  />
                  <span className="w-12 text-right">{searchDistance}km</span>
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={getUserLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? "Finding location..." : "Show My Location"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Nearby Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Nearby Events
              </CardTitle>
              <CardDescription>
                {userLocation ? (
                  nearbyEvents.length > 0 ? 
                    `${nearbyEvents.length} events within ${searchDistance}km` : 
                    `No events found within ${searchDistance}km`
                ) : (
                  "Enable location to see events near you"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-auto">
              {userLocation ? (
                nearbyEvents.length > 0 ? (
                  nearbyEvents.map(event => (
                    <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Badge className="mb-1">{event.category}</Badge>
                      <h3 className="text-base font-medium">{event.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="flex-grow">{event.location}</span>
                        <span className="font-medium">{event.distance!.toFixed(1)}km</span>
                      </div>
                      <Button asChild size="sm" variant="outline" className="mt-2 w-full">
                        <Link to={`/events/${event.id}`}>View Details</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p>No events found within {searchDistance}km.</p>
                    <p className="text-sm text-muted-foreground mt-1">Try increasing the search radius.</p>
                  </div>
                )
              ) : (
                <div className="text-center p-4">
                  <p>Enable location services to find events near you.</p>
                  <Button onClick={getUserLocation} className="mt-2">
                    Enable Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapView;
