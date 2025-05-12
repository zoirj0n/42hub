
import { UserRole } from "@/types/event";

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
  avatar?: string;
  role?: UserRole;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User, token: any) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, requestAdminRole: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  handle42Login: () => void;
  userRole: UserRole | null;
}

// Interface for the user data from the database
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  oauth_provider?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  metadata?: {
    request_admin?: boolean;
    provider?: string;
    [key: string]: any;
  };
}
