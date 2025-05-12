
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Event, EventRegistration } from "@/types/event";
import EventCard from "@/components/events/EventCard";
import { format } from "date-fns";

const UserDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (user?.id) {
      fetchUserRegistrations();
    }
  }, [user?.id]);

  const fetchUserRegistrations = async () => {
    setLoading(true);
    try {
      // Fetch user event registrations with event data
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          created_at,
          event:events (*)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Add type safety when converting Supabase data to our EventRegistration type
      const typedRegistrations: EventRegistration[] = (data || []).map(item => {
        const eventData = item.event as any;
        
        // Transform the database event to match our Event type
        const formattedEvent: Event = {
          id: eventData.id,
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          location: eventData.location,
          category: eventData.category,
          imageUrl: eventData.image_url,
          tags: eventData.tags,
          status: 'upcoming', // Default status if not provided
          registrationRequired: true, // Default setting
          organizerId: eventData.created_by,
          createdAt: eventData.created_at,
          updatedAt: eventData.updated_at
        };
        
        return {
          id: item.id,
          event_id: item.event_id,
          created_at: item.created_at,
          event: formattedEvent
        };
      });

      setRegistrations(typedRegistrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (events: EventRegistration[]) => {
    const now = new Date();
    
    if (activeTab === "upcoming") {
      return events.filter(
        (reg) => new Date(reg.event.date) >= now
      );
    } else {
      return events.filter(
        (reg) => new Date(reg.event.date) < now
      );
    }
  };

  const filteredEvents = filterEvents(registrations);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your events and registrations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Events</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{registrations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total event registrations
            </p>
            <Button className="mt-4 w-full" onClick={() => navigate("/")}>
              Browse Events
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Account</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">{user?.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Role: {userRole}
            </p>
            {userRole && ["pending_user", "pending_admin"].includes(userRole) && (
              <p className="text-xs text-yellow-500 mt-2">
                Your account is pending approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Next Event</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {registrations.length > 0 ? (
              <>
                <div className="text-md font-medium">
                  {registrations[0].event.title}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(registrations[0].event.date), "PPP 'at' p")}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full" 
                  onClick={() => navigate(`/events/${registrations[0].event.id}`)}
                >
                  View Details
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                You haven't registered for any events yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Registered Events</CardTitle>
                <CardDescription>
                  Events you've registered for that haven't happened yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>You haven't registered for any upcoming events.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => navigate("/")}
                    >
                      Browse Events
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                    {filteredEvents.map((registration) => (
                      <EventCard key={registration.id} event={registration.event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Past Attended Events</CardTitle>
                <CardDescription>
                  Previous events you've registered for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>You have no past event registrations.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                    {filteredEvents.map((registration) => (
                      <EventCard key={registration.id} event={registration.event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
