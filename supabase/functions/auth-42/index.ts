
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get redirect URI from environment or construct it from request URL
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://event-sync-dynamic.lovable.app";
    const redirectUri = `${origin}/oauth-callback`;
    
    console.log("Exchanging code for access token...");
    console.log("Redirect URI:", redirectUri);
    
    const clientId = Deno.env.get("CLIENT_ID");
    const clientSecret = Deno.env.get("CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error("Missing CLIENT_ID or CLIENT_SECRET environment variables");
      throw new Error("OAuth configuration is incomplete");
    }
    
    try {
      const tokenRes = await fetch("https://api.intra.42.fr/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error("Token exchange failed:", errorText);
        console.error("Status:", tokenRes.status);
        console.error("Status text:", tokenRes.statusText);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange code for token', details: errorText }), 
          { status: tokenRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenData = await tokenRes.json();
      console.log("Token received successfully");
      
      // Fetch user data with the access token
      console.log("Fetching user profile...");
      const userRes = await fetch("https://api.intra.42.fr/v2/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      if (!userRes.ok) {
        const errorText = await userRes.text();
        console.error("User profile fetch failed:", errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user profile', details: errorText }), 
          { status: userRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userData = await userRes.json();
      console.log("User profile fetched successfully");

      // Get Supabase service role client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing environment variables for Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      
      // Check if user exists with 42 id
      const { data: existingProfiles, error: profileError } = await supabase
        .from('users')
        .select('id, role, name, email')
        .eq('email', userData.email)
        .limit(1);
      
      // Determine appropriate user role
      let userRole = 'user';
      
      // If user exists, use their existing role
      if (existingProfiles && existingProfiles.length > 0) {
        userRole = existingProfiles[0].role;
      } 
      // If user has staff permission in 42, grant admin access automatically
      else if (userData.staff === true || userData.kind === 'admin') {
        userRole = 'admin';
      }

      // Generate a valid email for Supabase auth
      const validEmail = userData.email || `${userData.id}@42.edu`;

      // Create or update user in users table if they don't exist
      if (!existingProfiles || existingProfiles.length === 0) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userData.id.toString(),
            name: userData.displayname || `${userData.first_name} ${userData.last_name}`,
            email: validEmail,
            role: userRole,
            provider: '42'
          });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
        }
      }

      // Create a standardized user object with the necessary information
      const user = {
        id: userData.id.toString(),
        name: userData.displayname || `${userData.first_name} ${userData.last_name}`,
        email: validEmail,
        avatar: userData.image?.versions?.small || userData.image_url,
        role: userRole,
        provider: '42',
      };

      return new Response(
        JSON.stringify({ user, token: tokenData }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error during 42 API communication:", error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in 42 OAuth function:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
