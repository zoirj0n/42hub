
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Extract the code from query parameters
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const errorParam = params.get("error");
    const errorDescription = params.get("error_description");

    const processOAuthLogin = async () => {
      try {
        if (errorParam || errorDescription) {
          throw new Error(`Authentication error: ${errorDescription || errorParam}`);
        }
        
        if (!code) {
          throw new Error("No authorization code found");
        }

        console.log("Processing OAuth login with code...");
        
        // Process the authentication code
        const { data, error } = await supabase.functions.invoke('auth-42', {
          body: { code }
        });

        if (error) {
          console.error("Function invocation error:", error);
          throw new Error(error.message || "Authentication failed");
        }

        if (!data?.user) {
          console.error("No user data in response:", data);
          throw new Error("Authentication failed: No user data received");
        }

        // Use the login function from AuthContext to complete the authentication
        await login(data.user, data.token);
        
        toast({
          title: "Login successful",
          description: `Welcome, ${data.user.name}!`,
        });

        // Redirect to home page
        navigate("/");
      } catch (error: any) {
        console.error("Authentication failed:", error);
        setErrorMessage(error.message || "Failed to authenticate with 42");
        toast({
          title: "Authentication failed",
          description: error.message || "Failed to authenticate with 42",
          variant: "destructive",
        });
        // Wait a bit before redirecting to auth page
        setTimeout(() => navigate("/auth"), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthLogin();
  }, [location, navigate, login]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {isProcessing && !errorMessage ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <h2 className="mt-4 text-xl font-semibold">Authenticating...</h2>
          <p className="mt-2 text-muted-foreground">Please wait while we log you in.</p>
        </>
      ) : errorMessage ? (
        <>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-red-100 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-red-600">Authentication Failed</h2>
          <p className="mt-2 text-muted-foreground text-center">{errorMessage}</p>
          <p className="mt-4 text-sm">Redirecting to login page...</p>
        </>
      ) : (
        <>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-green-600">Authentication Successful</h2>
          <p className="mt-2 text-muted-foreground">You'll be redirected to the home page shortly...</p>
        </>
      )}
    </div>
  );
};

export default OAuthCallback;
