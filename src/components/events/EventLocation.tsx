
import { MapPin } from "lucide-react";

interface EventLocationProps {
  location: string;
  showIcon?: boolean;
  className?: string;
}

const EventLocation: React.FC<EventLocationProps> = ({
  location,
  showIcon = false,
  className = ""
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />}
      <span className="text-muted-foreground">{location}</span>
    </div>
  );
};

export default EventLocation;
