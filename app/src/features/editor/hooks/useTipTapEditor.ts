/**
 * useTipTapEditor.ts
 * 
 * Hook for TipTap editor integration with the editor store and spell/grammar checking
 */

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createSpellCheckExtension } from '../extensions/SpellCheckExtension';
import { useSuggestionsStore } from '../../suggestions/stores/suggestions.store';
import type { SuggestionError } from '../components/SuggestionsPopover';

interface UseTipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

/**
 * Convert suggestions to spell check errors for the editor
 */
function convertSuggestionsToErrors(suggestions: any[]): SuggestionError[] {
  return suggestions.map(suggestion => ({
    word: suggestion.original || suggestion.word || '',
    start: suggestion.position?.start || 0,
    end: suggestion.position?.end || 0,
    suggestions: suggestion.suggested ? [suggestion.suggested] : [],
    type: suggestion.type === 'grammar' ? 'grammar' : 'spelling',
    message: suggestion.description || suggestion.message
  }));
}

/**
 * Hook for TipTap editor integration with spell/grammar checking
 */
export function useTipTapEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...", 
  editable = true 
}: UseTipTapEditorProps) {
  const isUpdatingFromProp = useRef(false);
  const [selectedError, setSelectedError] = useState<SuggestionError | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  const { suggestions } = useSuggestionsStore();
  const errors = useMemo(() => convertSuggestionsToErrors(suggestions), [suggestions]);

  // Handle error click for showing suggestions
  const handleErrorClick = useCallback((error: SuggestionError) => {
    setSelectedError(error);
    
    // Get cursor position for popover
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      createSpellCheckExtension(errors, handleErrorClick),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none h-full min-h-[500px] p-6',
        'data-placeholder': placeholder,
        style: 'height: 100%; overflow-y: auto;'
      }
    },
    onUpdate: ({ editor }) => {
      // Prevent triggering onChange when we're updating from props
      if (isUpdatingFromProp.current) {
        return;
      }
      
      const html = editor.getHTML();
      onChange(html);
    }
  });

  // Handle suggestion actions (defined after editor)
  const handleReplace = useCallback((replacement: string) => {
    if (!selectedError || !editor) return;
    
    const { start, end } = selectedError;
    editor.commands.focus();
    editor.commands.setTextSelection({ from: start, to: end });
    editor.commands.insertContent(replacement);
    
    setSelectedError(null);
    setPopoverPosition(null);
  }, [selectedError, editor]);

  const handleIgnore = useCallback(() => {
    setSelectedError(null);
    setPopoverPosition(null);
  }, []);

  const handleAddToDictionary = useCallback(() => {
    // TODO: Implement add to dictionary functionality
    console.log('Add to dictionary:', selectedError?.word);
    setSelectedError(null);
    setPopoverPosition(null);
  }, [selectedError]);

  const handleClosePopover = useCallback(() => {
    setSelectedError(null);
    setPopoverPosition(null);
  }, []);

  // Update spell check decorations when errors change
  useEffect(() => {
    if (editor) {
      // Force re-render of decorations
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, errors]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isUpdatingFromProp.current = true;
      
      // Clear the editor completely first to avoid cursor conflicts
      editor.commands.clearContent(true);
      
      // Set new content with proper history clearing
      editor.commands.setContent(content, false);
      
      // Auto-focus the editor for better UX (only on initial document load)
      // Removed setTimeout to prevent layout shifts during typing
      
      // Reset flag after DOM updates
      setTimeout(() => {
        isUpdatingFromProp.current = false;
      }, 50);
    }
  }, [editor, content]);

  // Update editable state when prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Cleanup editor on unmount to prevent memory leaks and cursor conflicts
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return { 
    editor,
    selectedError,
    popoverPosition,
    handleReplace,
    handleIgnore,
    handleAddToDictionary,
    handleClosePopover
  };
} 
