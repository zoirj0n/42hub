
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogIn, LogOut, User, Shield, Users, Calendar, Bell, Map } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const { user, logout, isAuthenticated, userRole, isAuthenticating } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // No need to manually navigate - the logout function handles it
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
              <Calendar className="h-5 w-5 absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">42 HUB</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Events
            </Link>
            <Link to="/calendar" className="text-sm font-medium transition-colors hover:text-primary">
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Calendar
              </span>
            </Link>
            <Link to="/map" className="text-sm font-medium transition-colors hover:text-primary">
              <span className="flex items-center">
                <Map className="mr-1 h-4 w-4" />
                Map
              </span>
            </Link>
            {isAuthenticated && (
              <Link to="/subscriptions" className="text-sm font-medium transition-colors hover:text-primary">
                <span className="flex items-center">
                  <Bell className="mr-1 h-4 w-4" />
                  My Subscriptions
                </span>
              </Link>
            )}
            {isAuthenticated && userRole && ['admin', 'superadmin'].includes(userRole) && (
              <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                <span className="flex items-center">
                  <Shield className="mr-1 h-4 w-4" />
                  Admin
                </span>
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                <span className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  Dashboard
                </span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {userRole && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                        {userRole}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">My Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/subscriptions">My Subscriptions</Link>
                </DropdownMenuItem>
                {userRole && ['admin', 'superadmin'].includes(userRole) && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                {userRole === 'superadmin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/superadmin">Super Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut || isAuthenticating}
                  className="cursor-pointer"
                >
                  {isLoggingOut || isAuthenticating ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-primary rounded-full" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
