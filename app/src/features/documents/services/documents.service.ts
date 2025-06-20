/**
 * documents.service.ts – Document business logic and API operations
 * Handles all document-related API calls and business operations
 */

import {
  createDocument as apiCreateDocument,
  getAllDocuments as apiGetAllDocuments,
  getDocument as apiGetDocument,
  deleteDocument as apiDeleteDocument
} from './documents.api'

import { updateDocument as apiUpdateDocument } from './documents.api'

import { useDocumentsStore, type Document } from '../stores/documents.store'

/**
 * Documents service class for handling business operations
 */
export class DocumentsService {

  /**
   * Load all documents for the current user
   */
  async loadDocuments(): Promise<void> {
    useDocumentsStore.getState().setLoading(true)
    useDocumentsStore.getState().setError(null)
    
    try {
      const documents = await apiGetAllDocuments()
      useDocumentsStore.getState().setDocuments(documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
      useDocumentsStore.getState().setError(
        error instanceof Error ? error.message : 'Failed to load documents'
      )
    } finally {
      useDocumentsStore.getState().setLoading(false)
    }
  }

  /**
   * Load a specific document by number
   */
  async loadDocument(documentNumber: number): Promise<void> {
    useDocumentsStore.getState().setLoading(true)
    useDocumentsStore.getState().setError(null)
    
    try {
      const document = await apiGetDocument(documentNumber)
      if (document) {
        useDocumentsStore.getState().setCurrentDocument(document.number)
      } else {
        useDocumentsStore.getState().setError(`Document ${documentNumber} not found`)
      }
    } catch (error) {
      console.error('Failed to load document:', error)
      useDocumentsStore.getState().setError(
        error instanceof Error ? error.message : 'Failed to load document'
      )
    } finally {
      useDocumentsStore.getState().setLoading(false)
    }
  }

  /**
   * Create a new document
   */
  async createNewDocument(content = '', title?: string): Promise<Document | null> {
    useDocumentsStore.getState().setLoading(true)
    useDocumentsStore.getState().setError(null)
    
    try {
      // Create document with title in a single API call if title is provided
      const newDocument = await apiCreateDocument(content)
      if (newDocument) {
        // Only make additional API call if we need to update the title
        if (title && title.trim() && title !== 'Untitled') {
          try {
            const updatedDocument = await apiUpdateDocument(
              newDocument.number, 
              { title: title.trim() }
            )
            const finalDocument = updatedDocument || { ...newDocument, title: title.trim() }
            
            useDocumentsStore.getState().addDocument(finalDocument)
            useDocumentsStore.getState().setCurrentDocument(finalDocument.number)
            return finalDocument
          } catch (updateError) {
            // If title update fails, still use the created document
            console.warn('Failed to update document title:', updateError)
            useDocumentsStore.getState().addDocument(newDocument)
            useDocumentsStore.getState().setCurrentDocument(newDocument.number)
            return newDocument
          }
        } else {
          // No title update needed
          useDocumentsStore.getState().addDocument(newDocument)
          useDocumentsStore.getState().setCurrentDocument(newDocument.number)
          return newDocument
        }
      }
      return null
    } catch (error) {
      console.error('Failed to create document:', error)
      useDocumentsStore.getState().setError(
        error instanceof Error ? error.message : 'Failed to create document'
      )
      return null
    } finally {
      useDocumentsStore.getState().setLoading(false)
    }
  }

  /**
   * Update the current document with conflict resolution
   */
  async updateCurrentDocument(updates: { content?: string; title?: string; reference_numbers?: number[] }): Promise<void> {
    const currentDocument = useDocumentsStore.getState().getCurrentDocument()
    if (!currentDocument) return

    useDocumentsStore.getState().setError(null)
    
    try {
      const updatedDocument = await apiUpdateDocument(
        currentDocument.number, 
        updates
      )
      
      if (updatedDocument) {
        useDocumentsStore.getState().updateDocument(updatedDocument.number, updatedDocument)
      }
    } catch (error) {
      console.error('Failed to update document:', error)
      useDocumentsStore.getState().setError(
        error instanceof Error ? error.message : 'Failed to update document'
      )
    }
  }

  /**
   * Delete a document by number
   */
  async deleteDocumentByNumber(documentNumber: number): Promise<void> {
    useDocumentsStore.getState().setLoading(true)
    useDocumentsStore.getState().setError(null)
    
    try {
      await apiDeleteDocument(documentNumber)
      useDocumentsStore.getState().removeDocument(documentNumber)
    } catch (error) {
      console.error('Failed to delete document:', error)
      useDocumentsStore.getState().setError(
        error instanceof Error ? error.message : 'Failed to delete document'
      )
    } finally {
      useDocumentsStore.getState().setLoading(false)
    }
  }

  /**
   * Search documents using local filtering for better performance
   */
  async searchUserDocuments(query: string): Promise<void> {
    // For empty queries, just update the search query and let the store handle filtering
    if (!query.trim()) {
      useDocumentsStore.getState().setSearchQuery('')
      return
    }

    // Set the search query - the store will handle filtering locally
    useDocumentsStore.getState().setSearchQuery(query)
    
    // Only hit the API for complex searches or if we don't have documents loaded
    const currentDocuments = useDocumentsStore.getState().documents
    if (currentDocuments.length === 0) {
      // If no documents are loaded, load them first
      await this.loadDocuments()
    }
    
    // The filtering is now handled by the store's getFilteredDocuments method
  }
}

// Export singleton instance
export const documentsService = new DocumentsService() 
