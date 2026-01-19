import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Helper to try and get environment variables if they are exposed to the client
const getEnv = (key: string) => {
  try {
    // Check for Vite-style env vars
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // Check for standard process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // ignore errors
  }
  return null;
};

// Prioritize injected environment variables if available
const envUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabaseUrl = envUrl || `https://${projectId}.supabase.co`;
const supabaseKey = envKey || publicAnonKey;

// console.log('Supabase Client Initialized with:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
