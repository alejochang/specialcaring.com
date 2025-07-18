
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hdpmvplpcyqenkirwufu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkcG12cGxwY3lxZW5raXJ3dWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwOTI5MTAsImV4cCI6MjA1ODY2ODkxMH0.D6Idja2IMdxSJB8VUOvJEXehtYl81o7ihDSGkMW7TPM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
