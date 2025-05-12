
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents } from "@/contexts/EventContext";
import { Calendar, FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { events } = useEvents();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your events, users, and settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Events</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total events in the system
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/admin/events">
                <FileText className="mr-2 h-4 w-4" />
                Manage Events
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Create Event</CardTitle>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Add a new event to your calendar
            </p>
            <Button asChild variant="default" className="mt-4 w-full">
              <Link to="/admin/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
