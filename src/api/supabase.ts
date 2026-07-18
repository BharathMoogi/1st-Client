import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aurum-wellness.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cnVtLXdlbGxuZXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1MzEyMDAsImV4cCI6MjA4ODEwNzIwMH0.mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Prevents storage environment failures in react native mocks
    detectSessionInUrl: false,
  }
});
