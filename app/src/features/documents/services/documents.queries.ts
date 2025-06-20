/**
 * documents.queries.ts – Document query operations
 * Pure functions for document search, filtering, and specialized queries
 * These functions handle complex queries without business logic
 */

import { supabase } from '@/lib/supabase'

/**
 * Search documents by content and title
 */
export async function searchDocuments(searchTerm: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  if (!searchTerm.trim()) {
    return []
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get recent documents for the current user
 */
export async function getRecentDocuments(limit: number = 10) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get the next document number for the current user
 */
export async function getNextDocumentNumber(): Promise<number> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('number')
    .eq('user_id', user.id)
    .order('number', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  return data ? data.number + 1 : 1
}

/**
 * Get documents that don't reference any other documents (orphaned)
 */
export async function getOrphanedDocuments() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .or('reference_numbers.is.null,reference_numbers.eq.{}')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get documents ordered by reference count (most referenced first)
 */
export async function getPopularDocuments(limit: number = 10) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // This is a simplified version - in a real implementation, you'd want to
  // count references across all documents
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .not('reference_numbers', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
} 
