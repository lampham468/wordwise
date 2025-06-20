/**
 * useTipTapEditor.ts
 * 
 * Hook for TipTap editor integration with the editor store
 */

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';

interface UseTipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

/**
 * Hook for TipTap editor integration
 */
export function useTipTapEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...", 
  editable = true 
}: UseTipTapEditorProps) {
  const isUpdatingFromProp = useRef(false);

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
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
        'data-placeholder': placeholder
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

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isUpdatingFromProp.current = true;
      
      // Clear the editor completely first to avoid cursor conflicts
      editor.commands.clearContent(true);
      
      // Set new content with proper history clearing
      editor.commands.setContent(content, false);
      
      // Auto-focus the editor for better UX (only on document load, not content updates)
      if (content.length > 0) {
        setTimeout(() => {
          editor.commands.focus('end');
        }, 100);
      }
      
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

  return { editor };
} 
