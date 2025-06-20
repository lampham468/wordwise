/**
 * supabase.ts – Supabase client configuration
 * Configures the Supabase client for authentication and database operations
 * with user-scoped document management system
 */

import { createClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

/**
 * Supabase client instance with TypeScript support
 * Configured for user-scoped document management
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export default supabase

// Import the generated types from the auto-generated file
import type { Database } from '../types/supabase'

/**
 * Helper types for document operations
 */
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

// Re-export the Database type for convenience
export type { Database } 
