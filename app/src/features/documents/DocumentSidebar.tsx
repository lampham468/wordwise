/**
 * DocumentSidebar.tsx
 * 
 * Document sidebar component that manages all document operations.
 * Shows document list, search, and new document creation
 */

import { useEffect, useState, useCallback } from 'react'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import { useDocumentsStore } from './stores/documents.store'
import { DocumentList } from './components/DocumentList'
import { DocumentSearchBar } from './components/DocumentSearchBar'
import { NewDocumentButton } from './components/NewDocumentButton'

/**
 * Document sidebar component for managing documents
 * Uses the documents store directly - no props needed
 */
export function DocumentSidebar() {
  const {
    documents,
    isLoading,
    error,
    loadDocuments,
    createNewDocument,
    deleteDocumentByNumber,
    searchUserDocuments,
    clearError
  } = useDocuments()

  const { 
    currentDocumentId, 
    setCurrentDocument, 
    setSearchQuery,
    getFilteredDocuments 
  } = useDocumentsStore()

  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Load documents only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeDocuments = async () => {
      if (documents.length === 0 && !isLoading) {
        await loadDocuments();
      }
      if (isMounted) {
        setIsInitialized(true);
      }
    };
    
    initializeDocuments();
    
    return () => {
      isMounted = false;
    };
  }, []); // Only run once

  // Handle document selection logic more efficiently
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // If we have documents but none selected, select the first one
    if (documents.length > 0 && !currentDocumentId) {
      const firstDoc = documents[0];
      if (firstDoc) {
        setCurrentDocument(firstDoc.number);
      }
      return;
    }

    // If no documents exist, create one
    if (documents.length === 0 && !isLoading) {
      handleNewDocument();
    }
  }, [documents.length, currentDocumentId, isInitialized, isLoading]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
    searchUserDocuments(query);
  }, [setSearchQuery, searchUserDocuments]);

  const handleNewDocument = useCallback(async () => {
    const newDoc = await createNewDocument();
    if (newDoc) {
      setCurrentDocument(newDoc.number);
    }
  }, [createNewDocument, setCurrentDocument]);

  const handleDocumentSelect = useCallback((documentNumber: number) => {
    setCurrentDocument(documentNumber);
  }, [setCurrentDocument]);

  const handleDeleteDocument = useCallback(async (documentNumber: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocumentByNumber(documentNumber);
      
      // If we deleted the currently selected document
      if (currentDocumentId === documentNumber) {
        // If there are other documents, select the first one
        const remainingDocs = documents.filter(doc => doc.number !== documentNumber);
        if (remainingDocs.length > 0) {
          const firstDoc = remainingDocs[0];
          if (firstDoc) {
            setCurrentDocument(firstDoc.number);
          }
        } else {
          // No documents left, create a new one
          handleNewDocument();
        }
      }
    }
  }, [deleteDocumentByNumber, currentDocumentId, documents, setCurrentDocument, handleNewDocument]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="h-full bg-white border-r border-neutral-200 flex items-center justify-center">
        <div className="text-neutral-500 animate-pulse-subtle">Loading documents...</div>
      </div>
    );
  }

  // Use filtered documents from store
  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="h-full flex flex-col">
      {/* Search and New Document */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 relative">
          <div className={isSearchExpanded ? "w-full" : "flex-1"}>
            <DocumentSearchBar
              value={localSearchQuery}
              onSearch={handleSearch}
              disabled={isLoading}
              onExpandChange={setIsSearchExpanded}
            />
          </div>
          {!isSearchExpanded && (
            <div className="flex-1">
              <NewDocumentButton 
                onClick={handleNewDocument}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-error-50 border border-error-200 rounded">
          <p className="text-sm text-error-700 leading-relaxed">{error}</p>
          <button 
            onClick={clearError}
            className="text-xs text-error-600 hover:text-error-800 mt-1 transition-colors duration-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Document List */}
      <DocumentList
        documents={filteredDocuments}
        currentDocumentId={currentDocumentId}
        isLoading={isLoading}
        searchQuery={localSearchQuery}
        onDocumentSelect={handleDocumentSelect}
        onDocumentDelete={handleDeleteDocument}
      />
    </div>
  );
}

export default DocumentSidebar 
