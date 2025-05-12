
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EventForm from "@/components/events/EventForm";
import { useEvents } from "@/contexts/EventContext";
import { useState, useEffect } from "react";

const AdminEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEventById, updateEvent } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const event = id ? getEventById(id) : undefined;

  useEffect(() => {
    if (id && !event) {
      // If event not found, redirect to events list
      navigate("/admin/events", { replace: true });
    }
  }, [id, event, navigate]);

  const handleUpdateEvent = async (formData: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      updateEvent(id, formData);
      navigate("/admin/events");
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
      </div>

      <div className="rounded-lg border p-6">
        <EventForm 
          event={event} 
          onSubmit={handleUpdateEvent} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
};

export default AdminEdit;
