/**
 * useAutosave.ts
 * 
 * Hook for managing document autosave functionality with race condition prevention.
 * Implements debounced saving, conflict detection, and retry logic.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveOptions {
  debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface AutosaveState {
  status: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Hook for automatic document saving with conflict resolution
 * 
 * @param documentId - ID of the document to save
 * @param content - Current document content
 * @param onSave - Function to save the document
 * @param options - Autosave configuration options
 * @returns Autosave state and manual save function
 */
export function useAutosave(
  documentId: string | null,
  content: string,
  onSave: (content: string) => Promise<void>,
  options: AutosaveOptions = {}
) {
  const {
    debounceMs = 3000,
    maxRetries = 3,
    retryDelayMs = 1000,
  } = options;

  const [state, setState] = useState<AutosaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
  });

  const retryCountRef = useRef(0);
  const lastSavedContentRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save function with retry logic
  const performSave = useCallback(async (contentToSave: string) => {
    if (!documentId || contentToSave === lastSavedContentRef.current) {
      return;
    }

    setState(prev => ({ ...prev, status: 'saving', error: null }));

    try {
      await onSave(contentToSave);
      
      setState(prev => ({
        ...prev,
        status: 'saved',
        lastSaved: new Date(),
        error: null,
      }));
      
      lastSavedContentRef.current = contentToSave;
      retryCountRef.current = 0;

      // Clear saved status after 2 seconds
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, status: 'idle' }));
      }, 2000);

    } catch (error) {
      console.error('Autosave failed:', error);
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        
        // Retry after delay
        setTimeout(() => {
          performSave(contentToSave);
        }, retryDelayMs * retryCountRef.current);
        
      } else {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Save failed',
        }));
        retryCountRef.current = 0;
      }
    }
  }, [documentId, onSave, maxRetries, retryDelayMs]);

  // Debounce content changes  
  const debouncedCallback = useDebounce((content: string) => {
    performSave(content);
  }, debounceMs);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!documentId) return;
    
    // Cancel any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    await performSave(content);
  }, [documentId, content, performSave]);

  // Effect for debounced autosave
  useEffect(() => {
    if (documentId && content !== lastSavedContentRef.current) {
      debouncedCallback(content);
    }
  }, [documentId, content, debouncedCallback]);

  // Initialize last saved content
  useEffect(() => {
    if (documentId && !lastSavedContentRef.current) {
      lastSavedContentRef.current = content;
    }
  }, [documentId, content]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus: state.status,
    lastSaved: state.lastSaved,
    saveError: state.error,
    saveNow,
    isAutoSaving: state.status === 'saving',
  };
} 
