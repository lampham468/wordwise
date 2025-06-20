/**
 * useDocumentTitle.ts
 * 
 * Hook for managing document title editing state and operations.
 * Handles title editing mode, validation, and persistence.
 */

import { useState, useCallback } from 'react';

export interface DocumentTitleState {
  isEditing: boolean;
  originalTitle: string;
  currentTitle: string;
}

/**
 * Hook for managing document title editing functionality
 * 
 * @param initialTitle - Initial document title
 * @param onTitleUpdate - Callback when title is updated
 * @returns Title editing state and handlers
 */
export function useDocumentTitle(
  initialTitle: string,
  onTitleUpdate: (newTitle: string) => Promise<void>
) {
  const [titleState, setTitleState] = useState<DocumentTitleState>({
    isEditing: false,
    originalTitle: initialTitle,
    currentTitle: initialTitle,
  });

  const startEditing = useCallback(() => {
    setTitleState(prev => ({
      ...prev,
      isEditing: true,
      originalTitle: prev.currentTitle,
    }));
  }, []);

  const stopEditing = useCallback(() => {
    setTitleState(prev => ({
      ...prev,
      isEditing: false,
    }));
  }, []);

  const updateTitle = useCallback((newTitle: string) => {
    setTitleState(prev => ({
      ...prev,
      currentTitle: newTitle,
    }));
  }, []);

  const saveTitle = useCallback(async () => {
    if (titleState.currentTitle.trim() === '') {
      // Revert to original title if empty
      setTitleState(prev => ({
        ...prev,
        currentTitle: prev.originalTitle,
      }));
      return;
    }

    try {
      await onTitleUpdate(titleState.currentTitle.trim());
      setTitleState(prev => ({
        ...prev,
        originalTitle: prev.currentTitle,
      }));
    } catch (error) {
      console.error('Failed to save title:', error);
      // Revert to original title on error
      setTitleState(prev => ({
        ...prev,
        currentTitle: prev.originalTitle,
      }));
    }
  }, [titleState.currentTitle, onTitleUpdate]);

  const cancelEditing = useCallback(() => {
    setTitleState(prev => ({
      ...prev,
      currentTitle: prev.originalTitle,
      isEditing: false,
    }));
  }, []);

  return {
    title: titleState.currentTitle,
    isEditing: titleState.isEditing,
    startEditing,
    stopEditing,
    updateTitle,
    saveTitle,
    cancelEditing,
  };
} 
