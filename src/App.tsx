
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EventProvider } from "./contexts/EventContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import CalendarView from "./pages/CalendarView";
import MapView from "./pages/MapView";
import Subscriptions from "./pages/Subscriptions";
import Admin from "./pages/Admin";
import AdminEvents from "./pages/AdminEvents";
import AdminCreate from "./pages/AdminCreate";
import AdminEdit from "./pages/AdminEdit";
import OAuthCallback from "./components/OAuthCallback";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import SuperAdmin from "./pages/SuperAdmin";
import UserDashboard from "./pages/UserDashboard";

const App = () => {
  // Create a new QueryClient instance within the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <EventProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="flex min-h-screen flex-col bg-background">
                  <Header />
                  <div className="flex-grow">
                    <Routes>
                      <Route path="/" element={<EventList />} />
                      <Route path="/events/:id" element={<EventDetail />} />
                      <Route path="/calendar" element={<CalendarView />} />
                      <Route path="/map" element={<MapView />} />
                      <Route path="/oauth-callback" element={<OAuthCallback />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route 
                        path="/subscriptions" 
                        element={
                          <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                            <div className="container mx-auto px-4 py-8">
                              <Subscriptions />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                            <div className="container mx-auto px-4 py-8">
                              <UserDashboard />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                            <div className="container mx-auto px-4 py-8">
                              <Admin />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route 
                        path="/admin/events" 
                        element={
                          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                            <div className="container mx-auto px-4 py-8">
                              <AdminEvents />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route 
                        path="/admin/events/create" 
                        element={
                          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                            <div className="container mx-auto px-4 py-8">
                              <AdminCreate />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route 
                        path="/admin/events/edit/:id" 
                        element={
                          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                            <div className="container mx-auto px-4 py-8">
                              <AdminEdit />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route 
                        path="/superadmin" 
                        element={
                          <ProtectedRoute allowedRoles={["superadmin"]}>
                            <div className="container mx-auto px-4 py-8">
                              <SuperAdmin />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={
                        <div className="container mx-auto px-4 py-8">
                          <NotFound />
                        </div>
                      } />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              </BrowserRouter>
            </EventProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
