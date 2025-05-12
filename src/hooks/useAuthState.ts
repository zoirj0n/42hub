
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/event";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Fetch user role from database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, name, email')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      if (data?.role) {
        setUserRole(data.role as UserRole);
        
        // Update stored user with role
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.role = data.role;
          parsedUser.name = data.name || parsedUser.name;
          parsedUser.email = data.email || parsedUser.email;
          localStorage.setItem("user", JSON.stringify(parsedUser));
          setUser(parsedUser);
        } else {
          // Create a new user object if one doesn't exist
          const newUser = {
            id: userId,
            name: data.name || "User",
            email: data.email || "",
            role: data.role,
          };
          localStorage.setItem("user", JSON.stringify(newUser));
          setUser(newUser);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  };

  useEffect(() => {
    // Check for existing auth on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        if (parsedUser.id) {
          // Fetch current role from database
          fetchUserRole(parsedUser.id);
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
      }
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User is signed in, fetch their role
          await fetchUserRole(session.user.id);
          
          // If we have a user object in localStorage but not in state, set it
          const storedUser = localStorage.getItem("user");
          if (storedUser && !user) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error("Failed to parse stored user during auth change", e);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
          localStorage.removeItem("user");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    setUser,
    userRole,
    setUserRole,
    isAuthenticating,
    setIsAuthenticating,
    fetchUserRole
  };
};
