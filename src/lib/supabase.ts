import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment or localStorage override
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('MILL_SUPABASE_URL') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('MILL_SUPABASE_ANON_KEY') : null;

export const supabaseUrl = storedUrl || envUrl;
export const supabaseAnonKey = storedKey || envKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('MILL_SUPABASE_URL', url.trim());
    localStorage.setItem('MILL_SUPABASE_ANON_KEY', anonKey.trim());
  } else {
    localStorage.removeItem('MILL_SUPABASE_URL');
    localStorage.removeItem('MILL_SUPABASE_ANON_KEY');
  }
}
