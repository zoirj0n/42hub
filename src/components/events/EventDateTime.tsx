
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface EventDateTimeProps {
  date: string;
  showIcon?: boolean;
  className?: string;
}

const EventDateTime: React.FC<EventDateTimeProps> = ({
  date,
  showIcon = false,
  className = ""
}) => {
  return (
    <div className={`text-muted-foreground flex items-center ${className}`}>
      {showIcon && <Calendar className="mr-2 h-4 w-4" />}
      {format(new Date(date), 'PPP')} at {format(new Date(date), 'p')}
    </div>
  );
};

export default EventDateTime;
