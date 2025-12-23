import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client for backend operations
// Uses service role key for admin access (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Anon key for client-side operations (if needed)
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
