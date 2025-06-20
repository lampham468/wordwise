/**
 * EditorContent.tsx
 * 
 * Wrapper component for the TipTap editor content with loading states
 * and proper styling integration.
 */

import { EditorContent as TipTapEditorContent } from '@tiptap/react';
import { useTipTapEditor } from '../hooks/useTipTapEditor';
import { useEditorStore } from '../stores/editor.store';
import { useDocumentsStore } from '../../documents/stores/documents.store';

/**
 * TipTap editor content component with loading and empty states
 */
export function EditorContent() {
  const { content, setContent } = useEditorStore();
  const { currentDocumentId } = useDocumentsStore();
  const { editor } = useTipTapEditor({ 
    content, 
    onChange: setContent 
  });

  // Show placeholder when no document is selected
  if (!currentDocumentId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-neutral-500">
          <div className="text-lg font-medium mb-2">No document selected</div>
          <div className="text-sm">Select a document from the sidebar or create a new one to start writing.</div>
        </div>
      </div>
    );
  }

  // Show loading state while editor initializes
  if (!editor) {
    return (
      <div className="flex-1 px-4 py-2">
        <div className="max-w-editor mx-auto">
          <div className="min-h-[500px] p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-2">
      <div className="max-w-editor mx-auto">
        <div className="min-h-[500px] focus-within:outline-none">
          <TipTapEditorContent 
            key={currentDocumentId} // Force re-render when document changes
            editor={editor}
            className="prose prose-neutral max-w-none focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
} 
