
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types/auth";
import { UserRole } from "@/types/event";

export const useOAuth42Auth = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null>>,
  setIsAuthenticating: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const handle42Login = () => {
    // Redirect to 42 OAuth authorization URL
    const clientId = import.meta.env.VITE_42_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth-callback`);
    const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    
    window.location.href = oauthUrl;
  };

  const login = async (userObj: User, tokenData: any) => {
    try {
      // Set authenticating state before proceeding
      setIsAuthenticating(true);
      
      console.log("Authenticating with 42 OAuth...");
      
      if (!userObj) {
        throw new Error('No user data received');
      }
      
      // Save to localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
      
      if (userObj.role) {
        setUserRole(userObj.role as UserRole);
      } else {
        // Default role
        setUserRole('user');
      }
      
      // Use the user's email for authentication
      const email = userObj.email;
      
      // Create a strong password from the token and user ID
      const password = `${tokenData.access_token.substring(0, 10)}${userObj.id}${Date.now()}`;
      
      try {
        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.log("Sign-in failed, trying to sign up:", signInError);
          // If sign in fails, create the user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: userObj.name,
                provider: '42',
              }
            }
          });
          
          if (signUpError) {
            throw new Error(signUpError.message);
          }
          
          // Try signing in again after creating the account
          const { error: secondSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (secondSignInError) {
            throw new Error(secondSignInError.message);
          }
        }
      } catch (authError: any) {
        console.error("Auth error:", authError);
        // Even if Supabase auth fails, we still want to let users use the app
        // because we've already verified their identity with 42 OAuth
      }
      
      toast({
        title: "Login successful",
        description: `Welcome, ${userObj.name}!`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Unable to authenticate with 42. Please try again.",
        variant: "destructive",
      });
      // Clear any partial auth state
      localStorage.removeItem("user");
      setUser(null);
      setUserRole(null);
      throw error; // Re-throw to allow caller to handle
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    handle42Login,
    login
  };
};
