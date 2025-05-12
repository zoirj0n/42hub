import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useEvents } from "@/contexts/EventContext";
import EventCard from "@/components/events/EventCard";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Search, TrendingUp, Clock, Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addDays, isSameWeek, parseISO, isPast, isFuture } from "date-fns";
import HeroSection from "@/components/HeroSection";
import { supabase } from "@/integrations/supabase/client";

const EventList = () => {
  const { events } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Get distinct categories from database
        const { data, error } = await supabase
          .from('events')
          .select('category')
          .order('category')
          
        if (error) {
          throw error;
        }
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map(item => item.category))
        ).filter(Boolean) as string[];
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Filter events based on search query and category
  const filteredEvents = events.filter(event => {
    // Apply text search filter
    const matchesSearch = searchQuery.trim() ? 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) : 
      true;
    
    // Apply category filter
    const matchesCategory = selectedCategory ? event.category === selectedCategory : true;
    
    // Apply tab filter (all, trending, thisWeek)
    let matchesTab = true;
    if (selectedTab === "trending") {
      // For demo purposes, we'll consider the first two events as trending
      matchesTab = ["1", "2"].includes(event.id);
    } else if (selectedTab === "thisWeek") {
      const today = new Date();
      const eventDate = parseISO(event.date);
      matchesTab = isSameWeek(eventDate, today) && isFuture(eventDate);
    }
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleHeroSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedTab("all");
  };

  return (
    <>
      <HeroSection onSearch={handleHeroSearch} />
      
      <div className="container max-w-7xl mx-auto space-y-8 py-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
            
            <div className="hidden md:flex space-x-2">
              <Button variant="outline" asChild>
                <a href="/calendar">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  View Calendar
                </a>
              </Button>
              
              <Button variant="outline" asChild>
                <a href="/map">
                  <MapPin className="mr-2 h-4 w-4" />
                  View Map
                </a>
              </Button>
            </div>
          </div>
          
          {/* Tabs for different event views */}
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center">
                <TrendingUp className="mr-1 h-4 w-4" /> Top Events
              </TabsTrigger>
              <TabsTrigger value="thisWeek" className="flex items-center">
                <Clock className="mr-1 h-4 w-4" /> This Week
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by title, description, category, or location"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {loading ? (
              <div className="h-10 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-auto pb-1">
                <Badge variant="outline" className="flex items-center gap-1 cursor-pointer">
                  <Filter className="h-3 w-3" />
                  <span>Filter:</span>
                </Badge>
                
                <ScrollArea className="whitespace-nowrap pb-1">
                  <div className="flex gap-2">
                    <Badge 
                      variant={selectedCategory === null ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All
                    </Badge>
                    {categories.map((category) => (
                      <Badge 
                        key={category}
                        variant={selectedCategory === category ? "secondary" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="text-muted-foreground">
              {searchQuery.trim() || selectedCategory ? 
                "No events found matching your search." : 
                "No events available at the moment."}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EventList;
