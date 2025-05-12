
import { Badge } from "@/components/ui/badge";

interface EventTagListProps {
  tags: string[];
  variant?: "default" | "outline";
  className?: string;
}

const EventTagList: React.FC<EventTagListProps> = ({
  tags,
  variant = "outline",
  className = ""
}) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Badge key={tag} variant={variant}>
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default EventTagList;
