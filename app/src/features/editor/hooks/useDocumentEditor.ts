/**
 * useDocumentEditor.ts
 * 
 * Hook for managing editor content and text analysis functionality.
 * Handles content state, word counting, and readability analysis.
 */

import { useCallback } from 'react';
import { useEditorStore } from '../stores/editor.store';
import { analyzeText } from '@/utils/text-analysis';

export interface TextStats {
  wordCount: number;
  charCount: number;
  readabilityScore: number;
}

/**
 * Hook for managing document editor state and text analysis
 * 
 * Integrates with the editor store and automatically triggers autosave
 * when content changes.
 * 
 * @returns Editor state and handlers
 */
export function useDocumentEditor() {
  const { 
    content, 
    title,
    setContent, 
    setTitle,
    isSaving,
    saveError 
  } = useEditorStore();

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, [setContent]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, [setTitle]);

  // Calculate stats from current content
  const stats: TextStats = useCallback(() => {
    if (!content) {
      return {
        wordCount: 0,
        charCount: 0,
        readabilityScore: 0,
      };
    }

    const analysis = analyzeText(content);
    return {
      wordCount: analysis.words,
      charCount: analysis.characters,
      readabilityScore: 0, // TODO: Implement readability scoring
    };
  }, [content])();

  return {
    content,
    title,
    stats,
    isSaving,
    saveError,
    handleContentChange,
    handleTitleChange,
  };
} 
