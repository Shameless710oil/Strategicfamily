import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { projectId as importedProjectId, publicAnonKey as importedPublicAnonKey } from './info'

// Get environment variables safely for browser environment
const getEnvVar = (name: string) => {
  // Try different ways to access environment variables in browser
  if (typeof window !== 'undefined') {
    // Browser environment - check for Vite or other bundler env vars
    return (import.meta as any)?.env?.[name] || (window as any)?.[name];
  }
  // Server environment (if available)
  return (typeof Deno !== 'undefined' ? Deno.env.get(name) : 
          typeof process !== 'undefined' ? process.env[name] : undefined);
};

// Use the info.tsx values as primary source, with fallbacks
const supabaseUrl = importedProjectId ? `https://${importedProjectId}.supabase.co` : 
                   getEnvVar('VITE_SUPABASE_URL') || 
                   getEnvVar('SUPABASE_URL') || 
                   'https://demo-project.supabase.co'
                    
const supabaseAnonKey = importedPublicAnonKey || 
                       getEnvVar('VITE_SUPABASE_ANON_KEY') || 
                       getEnvVar('SUPABASE_ANON_KEY') || 
                       'demo-anon-key'

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey.substring(0, 10) + '...');

// Create a singleton instance
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Extract project ID from URL for API calls
export const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || importedProjectId || 'demo-project'
export const publicAnonKey = supabaseAnonKey