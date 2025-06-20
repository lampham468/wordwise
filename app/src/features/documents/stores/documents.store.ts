/**
 * documents.store.ts - Clean documents store with cross-store communication
 * 
 * Manages document state and integrates with editor store through simple
 * cross-store patterns. No complex caching or premature optimization.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { editorCrossStore, useEditorStore } from '@/features/editor/stores/editor.store'
import { updateDocument as apiUpdateDocument } from '../services/documents.api'

export interface Document {
  user_id: string
  number: number
  title: string
  content: string
  reference_numbers: number[]
  created_at: string
  updated_at: string
}

interface DocumentsState {
  // Core state
  documents: Document[]
  currentDocumentId: number | null
  searchQuery: string
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  updateDocument: (documentNumber: number, updates: Partial<Document>) => void
  removeDocument: (documentNumber: number) => void
  setCurrentDocument: (documentId: number | null) => void
  getCurrentDocument: () => Document | null
  setSearchQuery: (query: string) => void
  getFilteredDocuments: () => Document[]
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Cross-store integration
  initializeCrossStore: () => (() => void)
}

/**
 * Documents store - clean and simple
 */
export const useDocumentsStore = create<DocumentsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    documents: [],
    currentDocumentId: null,
    searchQuery: '',
    isLoading: false,
    error: null,

    // Document management
    setDocuments: (documents) => set({ documents }),
    
    addDocument: (document) => set(state => ({
      documents: [document, ...state.documents]
    })),
    
    updateDocument: (documentNumber, updates) => set(state => ({
      documents: state.documents.map(doc => 
        doc.number === documentNumber ? { ...doc, ...updates } : doc
      )
    })),
    
    removeDocument: (documentNumber) => set(state => ({
      documents: state.documents.filter(doc => doc.number !== documentNumber),
      currentDocumentId: state.currentDocumentId === documentNumber ? null : state.currentDocumentId
    })),

    // Current document
    setCurrentDocument: (documentId) => {
      const state = get()
      set({ currentDocumentId: documentId })
      
      // Notify editor
      if (documentId) {
        const document = state.documents.find(doc => doc.number === documentId)
        if (document) {
          editorCrossStore.loadDocument(documentId, document.content, document.title)
        }
      } else {
        editorCrossStore.clearEditor()
      }
    },

    getCurrentDocument: () => {
      const state = get()
      return state.currentDocumentId 
        ? state.documents.find(doc => doc.number === state.currentDocumentId) || null
        : null
    },

    // Search
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    
    getFilteredDocuments: () => {
      const state = get()
      if (!state.searchQuery.trim()) return state.documents
      
      const query = state.searchQuery.toLowerCase()
      return state.documents.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      )
    },

    // UI state
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Cross-store integration
    initializeCrossStore: () => {
      console.log('🔗 Initializing documents cross-store integration...')
      
      // Check for unsaved changes from previous session
      const checkUnsavedChanges = () => {
        try {
          const unsavedData = localStorage.getItem('wordwise_unsaved_changes')
          if (unsavedData) {
            const { documentId, content, title, timestamp } = JSON.parse(unsavedData)
            
            // Only recover changes from the last 5 minutes to avoid stale data
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
            if (timestamp > fiveMinutesAgo) {
              console.log('🔄 Recovering unsaved changes for document:', documentId)
              
              // Save the recovered changes
              apiUpdateDocument(documentId, { content, title })
                .then(() => {
                  console.log('✅ Recovered unsaved changes saved successfully')
                  // Update local state
                  get().updateDocument(documentId, { content, title })
                })
                .catch(error => {
                  console.error('❌ Failed to save recovered changes:', error)
                })
                .finally(() => {
                  // Clear the stored data regardless of success/failure
                  localStorage.removeItem('wordwise_unsaved_changes')
                })
            } else {
              console.log('🗑️ Discarding stale unsaved changes')
              localStorage.removeItem('wordwise_unsaved_changes')
            }
          }
        } catch (error) {
          console.error('❌ Error checking unsaved changes:', error)
          localStorage.removeItem('wordwise_unsaved_changes')
        }
      }
      
      // Check for unsaved changes after a brief delay to allow app initialization
      setTimeout(checkUnsavedChanges, 1000)
      
      // Listen for editor save requests (debounced autosave)
      const unsubscribeSave = editorCrossStore.onSaveNeeded(async (documentId, content, title) => {
        console.log('📝 Editor requesting save for document:', documentId)
        
        try {
          // Set saving state in editor
          const editorState = useEditorStore.getState()
          editorState.setSaving(true)
          editorState.clearSaveError()
          
          // Update local state immediately for optimistic UI
          get().updateDocument(documentId, { content, title })
          
          // Save to backend via API
          await apiUpdateDocument(documentId, { content, title })
          
          // Clear dirty state and saving state
          editorState.markClean()
          editorState.setSaving(false)
          
          console.log('✅ Document saved via cross-store')
        } catch (error) {
          console.error('❌ Cross-store save failed:', error)
          
          // Set error state in editor
          const editorState = useEditorStore.getState()
          editorState.setSaving(false)
          editorState.setSaveError(error instanceof Error ? error.message : 'Save failed')
          
          get().setError(error instanceof Error ? error.message : 'Save failed')
        }
      })
      
      // Listen for document deselection (immediate save)
      const unsubscribeDeselect = editorCrossStore.onDocumentDeselect(async (documentId, content, title) => {
        console.log('💾 Document deselected - saving immediately:', documentId)
        
        try {
          // Update local state immediately for optimistic UI
          get().updateDocument(documentId, { content, title })
          
          // Save to backend via API immediately (no loading state since it's background)
          await apiUpdateDocument(documentId, { content, title })
          
          console.log('✅ Document saved on deselect')
        } catch (error) {
          console.error('❌ Deselect save failed:', error)
          // Don't show UI error for background saves, just log
        }
      })

      // Add visibility change handler for reliable saves on page hide/refresh
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          const editorState = useEditorStore.getState()
          const { currentDocumentId, content, title, isDirty } = editorState
          
          if (isDirty && currentDocumentId) {
            console.log('📱 Page hidden - persisting unsaved changes:', currentDocumentId)
            
            // Store unsaved changes in localStorage for recovery
            const unsavedData = {
              documentId: currentDocumentId,
              content,
              title,
              timestamp: Date.now()
            }
            localStorage.setItem('wordwise_unsaved_changes', JSON.stringify(unsavedData))
            
            // Update local state immediately
            get().updateDocument(currentDocumentId, { content, title })
            
            console.log('💾 Unsaved changes stored for recovery')
          }
        }
      }

      // Add beforeunload as backup (shows warning dialog)
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        const editorState = useEditorStore.getState()
        const { currentDocumentId, content, title, isDirty } = editorState
        
        if (isDirty && currentDocumentId) {
          console.log('⚠️ Unsaved changes detected on page unload')
          
          // Store unsaved changes in localStorage for recovery
          const unsavedData = {
            documentId: currentDocumentId,
            content,
            title,
            timestamp: Date.now()
          }
          localStorage.setItem('wordwise_unsaved_changes', JSON.stringify(unsavedData))
          
          event.preventDefault()
          event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
          return 'You have unsaved changes. Are you sure you want to leave?'
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      console.log('✅ Cross-store integration initialized')
      
      // Return cleanup function
      return () => {
        unsubscribeSave()
        unsubscribeDeselect()
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }))
)

// Simple cross-store helpers
export const documentsCrossStore = {
  selectDocument: (documentId: number) => {
    useDocumentsStore.getState().setCurrentDocument(documentId)
  },

  getCurrentDocument: () => {
    return useDocumentsStore.getState().getCurrentDocument()
  },

  onDocumentChange: (callback: (document: Document | null) => void) => {
    return useDocumentsStore.subscribe(
      (state) => state.currentDocumentId,
      (currentDocumentId) => {
        const document = currentDocumentId 
          ? useDocumentsStore.getState().documents.find(doc => doc.number === currentDocumentId) || null
          : null
        callback(document)
      }
    )
  }
} 
