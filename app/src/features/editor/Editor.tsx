/**
 * Editor.tsx - Main editor component
 * 
 * Complete document editor that combines title editing, metadata display,
 * and rich text editing in a modular, cohesive interface.
 */

import { DocumentHeader } from './components/DocumentHeader';
import { EditorContent } from './components/EditorContent';
import { useEditorCrossStore } from './hooks/useEditorCrossStore';

/**
 * Main editor component that encapsulates document title and content editing
 * Combines header with document metadata and TipTap editor content
 */
export function Editor() {
  // Initialize cross-store communication and autosave
  useEditorCrossStore();
  
  return (
    <div className="h-full flex flex-col">
      <DocumentHeader />
      <div className="flex-1 min-h-0">
        <EditorContent />
      </div>
    </div>
  );
} 
