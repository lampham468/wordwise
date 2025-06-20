/**
 * useDocuments.ts – Composed documents hook
 * Provides a clean API combining stores and service for components
 */

import { useMemo } from 'react'
import { useDocumentsStore } from '../stores/documents.store'
import { documentsService } from '../services/documents.service'

/**
 * Main hook for document operations
 * Combines state management and business logic
 */
export function useDocuments() {
  // State from stores
  const {
    documents,
    getCurrentDocument,
    setCurrentDocument,
    isLoading,
    error,
    searchQuery,
    clearError
  } = useDocumentsStore()

  // Memoize the current document to prevent unnecessary recalculations
  const currentDocument = useMemo(() => getCurrentDocument(), [getCurrentDocument])

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    // State
    documents,
    currentDocument,
    isLoading,
    error,
    searchQuery,
    
    // Actions (these are already stable from the service)
    loadDocuments: documentsService.loadDocuments.bind(documentsService),
    loadDocument: documentsService.loadDocument.bind(documentsService),
    createNewDocument: documentsService.createNewDocument.bind(documentsService),
    updateCurrentDocument: documentsService.updateCurrentDocument.bind(documentsService),
    deleteDocumentByNumber: documentsService.deleteDocumentByNumber.bind(documentsService),
    searchUserDocuments: documentsService.searchUserDocuments.bind(documentsService),
    setCurrentDocument,
    clearError
  }), [
    documents,
    currentDocument,
    isLoading,
    error,
    searchQuery,
    setCurrentDocument,
    clearError
  ])
} 
