/**
 * useAuth.ts – Authentication hook for Supabase auth
 * Provides authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react'
import { type User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface SignUpData {
  email: string
  password: string
  name?: string
}

interface SignInData {
  email: string
  password: string
}

/**
 * Hook for managing authentication state and operations
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: error.message 
          }))
        } else {
          setState(prev => ({ 
            ...prev, 
            user: session?.user || null, 
            loading: false 
          }))
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to initialize authentication' 
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setState(prev => ({ 
          ...prev, 
          user: session?.user || null, 
          loading: false,
          error: null
        }))
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async ({ email, password, name }: SignUpData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      })

      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
        return { success: false, error: error.message }
      }

      setState(prev => ({ 
        ...prev, 
        loading: false 
      }))
      
      return { success: true, user: data.user }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Sign in with email and password
  const signIn = useCallback(async ({ email, password }: SignInData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
        return { success: false, error: error.message }
      }

      setState(prev => ({ 
        ...prev, 
        loading: false 
      }))
      
      return { success: true, user: data.user }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Save current document before logging out
      try {
        const { useEditorStore } = await import('@/features/editor/stores/editor.store')
        const { updateDocument } = await import('@/features/documents/services/documents.api')
        const { useDocumentsStore } = await import('@/features/documents/stores/documents.store')
        
        const editorState = useEditorStore.getState()
        const { currentDocumentId, content, title, isDirty } = editorState
        
        if (isDirty && currentDocumentId) {
          console.log('💾 Saving document before logout:', currentDocumentId)
          
          // Update local state
          useDocumentsStore.getState().updateDocument(currentDocumentId, { content, title })
          
          // Save to backend
          await updateDocument(currentDocumentId, { content, title })
          
          console.log('✅ Document saved before logout')
        }
      } catch (saveError) {
        console.error('❌ Failed to save document before logout:', saveError)
        // Continue with logout even if save fails
      }
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
        return { success: false, error: error.message }
      }

      setState(prev => ({ 
        ...prev, 
        user: null, 
        loading: false 
      }))
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signOut,
    clearError,
    isAuthenticated: !!state.user
  }
} 
