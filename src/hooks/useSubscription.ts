
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const useSubscription = (eventId?: string) => {
  const { isAuthenticated, user } = useAuth();
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  
  // Load saved subscriptions and favorites from localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedSubscriptions = localStorage.getItem(`subscriptions_${user.id}`);
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      
      if (savedSubscriptions) {
        setSubscribedEvents(JSON.parse(savedSubscriptions));
      }
      
      if (savedFavorites) {
        setFavoriteEvents(JSON.parse(savedFavorites));
      }
    }
  }, [isAuthenticated, user]);
  
  // Save changes to localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`subscriptions_${user.id}`, JSON.stringify(subscribedEvents));
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favoriteEvents));
    }
  }, [subscribedEvents, favoriteEvents, isAuthenticated, user]);
  
  // Check subscription status for the current event
  const isSubscribed = eventId ? subscribedEvents.includes(eventId) : false;
  
  // Check if event is a favorite
  const isFavorite = eventId ? favoriteEvents.includes(eventId) : false;
  
  // Toggle subscription status
  const toggleSubscription = () => {
    if (!isAuthenticated || !eventId) return;
    
    setSubscribedEvents(prev => {
      if (prev.includes(eventId)) {
        toast({
          title: "Unsubscribed",
          description: "You will not receive notifications for this event",
        });
        return prev.filter(id => id !== eventId);
      } else {
        toast({
          title: "Subscribed",
          description: "You will receive notifications for this event",
        });
        return [...prev, eventId];
      }
    });
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    if (!isAuthenticated || !eventId) return;
    
    setFavoriteEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        toast({
          title: "Added to favorites",
          description: "Event has been added to your favorites",
        });
        return [...prev, eventId];
      }
    });
  };
  
  // Subscribe to an event
  const subscribe = (id: string) => {
    if (!isAuthenticated) return;
    setSubscribedEvents(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };
  
  // Unsubscribe from an event
  const unsubscribe = (id: string) => {
    if (!isAuthenticated) return;
    setSubscribedEvents(prev => prev.filter(eventId => eventId !== id));
  };
  
  // Add to favorites
  const favorite = (id: string) => {
    if (!isAuthenticated) return;
    setFavoriteEvents(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };
  
  // Remove from favorites
  const unfavorite = (id: string) => {
    if (!isAuthenticated) return;
    setFavoriteEvents(prev => prev.filter(eventId => eventId !== id));
  };
  
  // Get all subscribed event IDs
  const getSubscribedEventIds = () => subscribedEvents;
  
  // Get all favorite event IDs
  const getFavoriteEventIds = () => favoriteEvents;
  
  return {
    isSubscribed,
    isFavorite,
    toggleSubscription,
    toggleFavorite,
    subscribe,
    unsubscribe,
    favorite,
    unfavorite,
    getSubscribedEventIds,
    getFavoriteEventIds
  };
};
