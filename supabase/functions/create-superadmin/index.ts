
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing environment variables for Supabase');
    }

    // Setup Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // First check if the users already exist to avoid duplicate creation errors
    const { data: existingUsers, error: queryError } = await supabase
      .from('users')
      .select('email')
      .in('email', ['superadmin@example.com', 'admin@example.com', 'user@example.com']);
      
    if (queryError) {
      console.error("Error checking for existing users:", queryError);
    }
    
    const existingEmails = existingUsers ? existingUsers.map(u => u.email) : [];
    console.log("Existing emails:", existingEmails);
    
    // Create test users array with all the users we want to create
    const testUsers = [
      { email: 'superadmin@example.com', password: 'SuperAdmin123!', role: 'superadmin', name: 'Super Admin' },
      { email: 'admin@example.com', password: 'Admin123!', role: 'admin', name: 'Test Admin' },
      { email: 'user@example.com', password: 'User123!', role: 'user', name: 'Test User' }
    ];
    
    const createdUsers = [];
    const errors = [];

    // Process each user
    for (const testUser of testUsers) {
      // Skip if user already exists
      if (existingEmails.includes(testUser.email)) {
        console.log(`User ${testUser.email} already exists, skipping creation`);
        createdUsers.push({ email: testUser.email, role: testUser.role, status: 'already exists' });
        continue;
      }
      
      try {
        console.log(`Creating user: ${testUser.email} with role: ${testUser.role}`);
        
        // Create user in auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true, // Auto-confirm the email
          user_metadata: {
            name: testUser.name,
            role: testUser.role,
          },
        });

        if (authError) {
          console.error(`Failed to create user ${testUser.email}:`, authError);
          errors.push({ email: testUser.email, error: authError.message });
          continue;
        }

        if (!authUser?.user?.id) {
          console.error(`User was created but no ID was returned for ${testUser.email}`);
          errors.push({ email: testUser.email, error: 'No user ID returned' });
          continue;
        }

        // We'll wait a moment before trying to insert/update the user profile
        // This gives time for any database triggers to run
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if the user profile was created by the trigger
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.user.id)
          .single();
          
        if (profileCheckError || !existingProfile) {
          console.log(`User profile not created by trigger for ${testUser.email}, creating manually`);
          
          // Insert directly into users table since the trigger didn't work
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.user.id,
              email: testUser.email,
              name: testUser.name,
              role: testUser.role,
            });

          if (insertError) {
            console.error(`Failed to create user profile for ${testUser.email}:`, insertError);
            errors.push({ email: testUser.email, error: `Profile creation failed: ${insertError.message}` });
            continue;
          }
        } else {
          console.log(`User profile already exists for ${testUser.email}, updating role if needed`);
          
          // Check if we need to update the role
          if (existingProfile.role !== testUser.role) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: testUser.role })
              .eq('id', authUser.user.id);
              
            if (updateError) {
              console.error(`Failed to update role for ${testUser.email}:`, updateError);
              errors.push({ email: testUser.email, error: `Role update failed: ${updateError.message}` });
              continue;
            }
          }
        }

        createdUsers.push({ email: testUser.email, role: testUser.role, status: 'created' });
        console.log(`Successfully created user: ${testUser.email} with role: ${testUser.role}`);
      } catch (error) {
        console.error(`Unexpected error creating user ${testUser.email}:`, error);
        errors.push({ email: testUser.email, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        message: errors.length > 0 ? 'Some test users created with errors' : 'Test users created successfully',
        users: testUsers.map(user => ({ 
          email: user.email, 
          password: user.password, 
          role: user.role 
        })),
        created: createdUsers,
        errors: errors
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating test users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
