/**
 * documents.api.ts – Core API operations for documents
 * Pure functions for document CRUD operations with user scoping
 * These functions handle direct database access without business logic
 */

import { supabase } from '@/lib/supabase'



/**
 * Create a new document for the current user
 */
export async function createDocument(content: string = '', referenceNumbers: number[] = []) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .rpc('create_document', {
      p_user_id: user.id,
      p_content: content,
      p_reference_numbers: referenceNumbers
    })

  if (error) throw error
  return data?.[0] || null
}

/**
 * Get a specific document by number for the current user
 */
export async function getDocument(documentNumber: number) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .rpc('get_user_document', {
      p_user_id: user.id,
      p_number: documentNumber
    })

  if (error) throw error
  return data?.[0] || null
}

/**
 * Get all documents for the current user
 */
export async function getAllDocuments() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('number', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Update a document by number with basic validation
 */
export async function updateDocument(
  documentNumber: number, 
  updates: { content?: string, title?: string, reference_numbers?: number[] }
) {
  console.log('🗄️ API: Updating document', documentNumber, 'with updates:', Object.keys(updates));
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.log('❌ API: Authentication failed for document update');
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .eq('number', documentNumber)
    .select()
    .single()

  if (error) {
    console.error('❌ API: Database error updating document:', error);
    throw error;
  }
  
  console.log('✅ API: Document updated successfully:', data?.number);
  return data
}

/**
 * Delete a document by number for the current user
 */
export async function deleteDocument(documentNumber: number) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('user_id', user.id)
    .eq('number', documentNumber)

  if (error) throw error
}

/**
 * Check if a document exists for the current user
 */
export async function documentExists(documentNumber: number): Promise<boolean> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('number')
    .eq('user_id', user.id)
    .eq('number', documentNumber)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
} 
