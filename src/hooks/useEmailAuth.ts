
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types/auth";
import { UserRole } from "@/types/event";

export const useEmailAuth = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null>>,
  setIsAuthenticating: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const loginWithEmail = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if there's a user profile in our database
        const { data: profiles, error: profileError } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('email', email)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile:", profileError);
        }

        // Create a user object from Supabase auth user
        const userObj: User = {
          id: data.user.id,
          name: profiles?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: (profiles?.role as UserRole) || 'user'
        };

        // Save to localStorage for persistence
        localStorage.setItem("user", JSON.stringify(userObj));
        setUser(userObj);
        setUserRole(userObj.role as UserRole || 'user');

        toast({
          title: "Login successful",
          description: `Welcome, ${userObj.name}!`,
        });
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Unable to authenticate. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string,
    requestAdmin: boolean = false
  ) => {
    try {
      setIsAuthenticating(true);
      
      // First, check if a user already exists with this email
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .limit(1);

      if (checkError) {
        console.error("Error checking existing user:", checkError);
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error("A user with this email already exists");
      }

      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Determine role based on request - using 'user' role for now, even for admin requests
        // The actual 'admin' role will be assigned by a superadmin later if requested
        const role: "user" | "admin" | "superadmin" = 'user'; // Using only allowed roles

        // Create a user record in our users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: name,
            email: data.user.email,
            role: role
          });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          throw insertError;
        }

        // Only sign in automatically if it's a regular user (not admin request)
        if (!requestAdmin) {
          // Create a user object
          const userObj: User = {
            id: data.user.id,
            name: name,
            email: data.user.email || '',
            role: 'user'
          };

          // Save to localStorage for persistence
          localStorage.setItem("user", JSON.stringify(userObj));
          setUser(userObj);
          setUserRole('user');

          toast({
            title: "Registration successful",
            description: `Welcome, ${name}!`,
          });
        } else {
          toast({
            title: "Registration successful",
            description: "Your admin request has been submitted for approval.",
          });
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    loginWithEmail,
    register
  };
};
