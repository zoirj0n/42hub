
export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number;
  image?: string;
  imageUrl?: string; // Added imageUrl property
  category: string;
  attendees?: number;
  tags?: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationRequired: boolean;
  registrationUrl?: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional properties for map functionality
  latitude?: number;
  longitude?: number;
  distance?: number;
};

export type UserRole = "user" | "admin" | "superadmin" | "pending";

export interface EventFilters {
  search?: string;
  category?: string;
  date?: string;
  location?: string;
  status?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

// Define EventRegistration interface for UserDashboard
export interface EventRegistration {
  id: string;
  event_id: string;
  created_at: string;
  event: Event;
}
