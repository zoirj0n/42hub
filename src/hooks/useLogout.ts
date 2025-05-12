
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/types/event";

export const useLogout = (
  setUser: React.Dispatch<React.SetStateAction<any | null>>,
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null>>,
  setIsAuthenticating: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const logout = async () => {
    try {
      setIsAuthenticating(true);
      
      // First, remove user from local storage 
      // This prevents any race conditions or state inconsistencies
      localStorage.removeItem("user");
      
      // Clear user state immediately
      setUser(null);
      setUserRole(null);
      
      // Then, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to home page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return { logout };
};
