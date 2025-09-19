import { createClient } from '@supabase/supabase-js';
import { logEnvironmentStatus } from './env-check';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

// Log environment status in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus();
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
