
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const featuredImages = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

const HeroSection = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % featuredImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 z-10"></div>
      
      <div className="relative h-[500px] overflow-hidden">
        {featuredImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-full w-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-32 w-32 text-primary/20" />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="text-center max-w-3xl px-4 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Discover Amazing 42 Community Events
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Find and join the best workshops, hackathons, and conferences organized by the 42 community.
          </p>
          
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex w-full max-w-lg mx-auto mt-6 gap-2"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for events..."
                className="pl-10 h-11 bg-background/90 backdrop-blur-sm border-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-11">Search</Button>
          </form>
          
          <div className="pt-4 flex justify-center gap-4">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" asChild>
              <Link to="/calendar">View Calendar</Link>
            </Button>
            <Button asChild>
              <Link to="/subscriptions">My Subscriptions</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
