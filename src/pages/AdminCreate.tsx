
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EventForm from "@/components/events/EventForm";
import { useEvents } from "@/contexts/EventContext";
import { useState } from "react";

const AdminCreate = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateEvent = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Process the form data
      addEvent(formData);
      navigate("/admin/events");
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
      </div>

      <div className="rounded-lg border p-6">
        <EventForm onSubmit={handleCreateEvent} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default AdminCreate;
