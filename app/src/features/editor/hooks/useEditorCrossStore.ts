/**
 * useEditorCrossStore.ts - Simple hook for cross-store editor integration
 * 
 * Clean, simple hook that encapsulates cross-store communication
 * without over-engineering or redundant complexity.
 */

import { useEffect } from 'react'
import { useEditorStore } from '../stores/editor.store'
import { useDocumentsStore } from '@/features/documents/stores/documents.store'

/**
 * Hook for cross-store editor integration
 */
export function useEditorCrossStore() {
  // Get state from stores
  const { 
    content, 
    title, 
    currentDocumentId,
    isSaving, 
    saveError,
    isDirty,
    setContent, 
    setTitle,
    clearSaveError
  } = useEditorStore()

  const { initializeCrossStore } = useDocumentsStore()

  // Initialize cross-store communication once
  useEffect(() => {
    const cleanup = initializeCrossStore()
    return cleanup
  }, [initializeCrossStore])

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    clearSaveError()
  }

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    clearSaveError()
  }

  return {
    // Current state
    content,
    title,
    currentDocumentId,
    isSaving,
    saveError,
    isDirty,
    
    // Actions
    handleContentChange,
    handleTitleChange,
    clearSaveError,
    
    // Status helpers
    hasUnsavedChanges: isDirty,
    saveStatus: isSaving ? 'saving' : isDirty ? 'unsaved' : 'saved'
  }
} 
