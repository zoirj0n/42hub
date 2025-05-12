
import { createContext, useContext } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthMethods } from "@/hooks/useAuthMethods";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    user, 
    setUser, 
    userRole, 
    setUserRole, 
    isAuthenticating, 
    setIsAuthenticating,
    fetchUserRole
  } = useAuthState();

  const { 
    handle42Login, 
    login, 
    loginWithEmail, 
    register, 
    logout 
  } = useAuthMethods(setUser, setUserRole, setIsAuthenticating, fetchUserRole);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        loginWithEmail,
        register,
        logout, 
        isAuthenticated: !!user, 
        isAuthenticating,
        handle42Login,
        userRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
