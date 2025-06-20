/**
 * editor.store.ts - Clean editor store with cross-store communication
 * 
 * Manages editor state with simple, clean boundaries for communication
 * with other features. No over-engineering, just what's needed.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface EditorState {
  // Content state
  content: string
  title: string
  currentDocumentId: number | null
  
  // UI state
  isEditingTitle: boolean
  editingTitle: string
  isSaving: boolean
  saveError: string | null
  isDirty: boolean
  
  // Actions
  setContent: (content: string) => void
  setTitle: (title: string) => void
  setCurrentDocument: (documentId: number | null, content: string, title: string) => void
  setSaving: (saving: boolean) => void
  setSaveError: (error: string | null) => void
  clearSaveError: () => void
  
  // Title editing
  startEditingTitle: () => void
  updateEditingTitle: (title: string) => void
  commitTitleEdit: () => void
  cancelTitleEdit: () => void
  
  // State management
  markDirty: () => void
  markClean: () => void
}

/**
 * Editor store - clean and simple
 */
export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    content: '',
    title: '',
    currentDocumentId: null,
    isEditingTitle: false,
    editingTitle: '',
    isSaving: false,
    saveError: null,
    isDirty: false,

    // Content actions
    setContent: (content) => {
      set({ content, isDirty: true })
    },

    setTitle: (title) => {
      set({ title, isDirty: true })
    },

    setCurrentDocument: (documentId, content, title) => {
      set({ 
        currentDocumentId: documentId,
        content, 
        title, 
        isDirty: false,
        isSaving: false,
        saveError: null,
        isEditingTitle: false,
        editingTitle: ''
      })
    },

    // Save state
    setSaving: (isSaving) => set({ isSaving }),
    setSaveError: (saveError) => set({ saveError }),
    clearSaveError: () => set({ saveError: null }),

    // Title editing
    startEditingTitle: () => {
      const { title } = get()
      set({ isEditingTitle: true, editingTitle: title })
    },

    updateEditingTitle: (editingTitle) => set({ editingTitle }),

    commitTitleEdit: () => {
      const { editingTitle } = get()
      set({ 
        title: editingTitle,
        isEditingTitle: false,
        editingTitle: '',
        isDirty: true
      })
    },

    cancelTitleEdit: () => {
      set({ isEditingTitle: false, editingTitle: '' })
    },

    // State management
    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false })
  }))
)

// Simple cross-store helpers
export const editorCrossStore = {
  onContentChange: (callback: (content: string, documentId: number | null) => void) => {
    return useEditorStore.subscribe(
      (state) => ({ content: state.content, documentId: state.currentDocumentId }),
      ({ content, documentId }) => callback(content, documentId)
    )
  },

  onTitleChange: (callback: (title: string, documentId: number | null) => void) => {
    return useEditorStore.subscribe(
      (state) => ({ title: state.title, documentId: state.currentDocumentId }),
      ({ title, documentId }) => callback(title, documentId)
    )
  },

  onSaveNeeded: (callback: (documentId: number, content: string, title: string) => void) => {
    let saveTimeout: NodeJS.Timeout | null = null
    
    return useEditorStore.subscribe(
      (state) => ({ 
        isDirty: state.isDirty, 
        documentId: state.currentDocumentId,
        content: state.content,
        title: state.title
      }),
      ({ isDirty, documentId, content, title }) => {
        // Clear any existing timeout
        if (saveTimeout) {
          clearTimeout(saveTimeout)
          saveTimeout = null
        }
        
        // Only trigger save if document is dirty and we have a document ID
        if (isDirty && documentId) {
          console.log('🔄 Scheduling save for document:', documentId)
          
          // Debounce the save by 2 seconds
          saveTimeout = setTimeout(() => {
            console.log('📝 Executing debounced save for document:', documentId)
            callback(documentId, content, title)
          }, 2000)
        }
      }
    )
  },

  onDocumentDeselect: (callback: (documentId: number, content: string, title: string) => void) => {
    let previousDocumentId: number | null = null
    let previousContent = ''
    let previousTitle = ''
    let wasDirty = false
    
    return useEditorStore.subscribe(
      (state) => ({ 
        documentId: state.currentDocumentId,
        content: state.content,
        title: state.title,
        isDirty: state.isDirty
      }),
      ({ documentId, content, title, isDirty }) => {
        // If document ID changed and we had a previous dirty document, save it immediately
        if (previousDocumentId !== null && 
            previousDocumentId !== documentId && 
            wasDirty) {
          console.log('💾 Document deselected - saving immediately:', previousDocumentId)
          callback(previousDocumentId, previousContent, previousTitle)
        }
        
        // Update tracking variables
        previousDocumentId = documentId
        previousContent = content
        previousTitle = title
        wasDirty = isDirty
      }
    )
  },

  loadDocument: (documentId: number, content: string, title: string) => {
    useEditorStore.getState().setCurrentDocument(documentId, content, title)
  },

  clearEditor: () => {
    useEditorStore.getState().setCurrentDocument(null, '', '')
  }
} 
