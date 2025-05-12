
import { useState } from "react";
import { User } from "@/types/auth";
import { UserRole } from "@/types/event";
import { useOAuth42Auth } from "./useOAuth42Auth";
import { useEmailAuth } from "./useEmailAuth";
import { useLogout } from "./useLogout";

export const useAuthMethods = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null>>,
  setIsAuthenticating: React.Dispatch<React.SetStateAction<boolean>>,
  fetchUserRole: (userId: string) => Promise<void>
) => {
  // Import methods from separate hooks
  const { handle42Login, login } = useOAuth42Auth(
    setUser,
    setUserRole,
    setIsAuthenticating
  );
  
  const { loginWithEmail, register } = useEmailAuth(
    setUser,
    setUserRole,
    setIsAuthenticating
  );
  
  const { logout } = useLogout(
    setUser,
    setUserRole,
    setIsAuthenticating
  );

  return {
    handle42Login,
    login,
    loginWithEmail,
    register,
    logout
  };
};
