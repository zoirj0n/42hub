
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface EventRegistrationProps {
  eventId: string;
  className?: string;
}

const EventRegistration = ({ eventId, className }: EventRegistrationProps) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Validate if eventId is a proper UUID
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };
  
  // Convert short IDs to proper UUIDs if needed
  const getValidEventId = (id: string): string => {
    if (isValidUUID(id)) return id;
    
    // If it's numeric or short, create a deterministic UUID from it
    try {
      // Create a deterministic UUID based on the input string
      const namespace = '1b671a64-40d5-491e-99b0-da01ff1f3341'; // Arbitrary namespace UUID
      return uuidv4({ namespace: namespace, name: id });
    } catch (e) {
      console.error("Failed to generate valid UUID:", e);
      return id; // Return original as fallback (will likely fail, but prevents app crash)
    }
  };

  // First, check if the event exists in Supabase
  const checkEventExists = async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .eq("id", id)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking event existence:", error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error("Failed to check event existence:", err);
      return false;
    }
  };

  // Check if user is already registered for this event
  useEffect(() => {
    const checkRegistration = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }
      
      // Ensure we have a valid UUID for the event
      if (!eventId) {
        console.error("No event ID provided");
        setIsLoading(false);
        return;
      }
      
      const validEventId = getValidEventId(eventId);

      // First check if event exists in database
      const eventExists = await checkEventExists(validEventId);
      if (!eventExists) {
        setErrorState("This event doesn't exist in our database yet");
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("event_registrations")
          .select("id")
          .eq("user_id", user.id)
          .eq("event_id", validEventId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking registration:", error);
        }
        
        setIsRegistered(!!data);
      } catch (error) {
        console.error("Failed to check registration:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRegistration();
  }, [eventId, user?.id, isAuthenticated]);

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for events",
      });
      return;
    }

    if (!eventId) {
      toast({
        title: "Registration error",
        description: "Invalid event ID",
        variant: "destructive",
      });
      return;
    }

    const validEventId = getValidEventId(eventId);
    
    // Check if event exists before proceeding
    const eventExists = await checkEventExists(validEventId);
    if (!eventExists) {
      toast({
        title: "Registration error",
        description: "This event doesn't exist in the database",
        variant: "destructive",
      });
      return;
    }
    
    setIsRegistering(true);

    try {
      if (isRegistered) {
        // Cancel registration
        const { error } = await supabase
          .from("event_registrations")
          .delete()
          .eq("user_id", user?.id)
          .eq("event_id", validEventId);

        if (error) throw error;

        setIsRegistered(false);
        toast({
          title: "Registration cancelled",
          description: "You have been unregistered from this event",
        });
      } else {
        // Register for event
        const { error } = await supabase
          .from("event_registrations")
          .insert({
            user_id: user?.id,
            event_id: validEventId,
          });

        if (error) throw error;

        setIsRegistered(true);
        toast({
          title: "Registration successful",
          description: "You have been registered for this event",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (errorState) {
    return (
      <Button disabled variant="outline" className={className}>
        <span className="text-amber-500">{errorState}</span>
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleRegistration} 
      disabled={isRegistering}
      variant={isRegistered ? "secondary" : "default"}
      className={className}
    >
      {isRegistering ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isRegistered ? "Cancelling..." : "Registering..."}
        </>
      ) : isRegistered ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Registered
        </>
      ) : (
        <>
          Register for Event
        </>
      )}
    </Button>
  );
};

export default EventRegistration;
