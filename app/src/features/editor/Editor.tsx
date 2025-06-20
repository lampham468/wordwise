/**
 * Editor.tsx - Main editor component
 * 
 * Complete document editor that combines title editing, metadata display,
 * and rich text editing in a modular, cohesive interface.
 */

import { DocumentHeader } from './components/DocumentHeader';
import { EditorContent } from './components/EditorContent';
import { useEditorCrossStore } from './hooks/useEditorCrossStore';
import { useWritingAnalysis } from '@/features/suggestions/hooks/useWritingAnalysis';

/**
 * Main editor component that encapsulates document title and content editing
 * Combines header with document metadata and TipTap editor content
 */
export function Editor() {
  // Initialize cross-store communication and autosave
  const { content } = useEditorCrossStore();
  
  // Initialize comprehensive writing analysis (grammar + spelling)
  useWritingAnalysis(content);
  
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col">
        <DocumentHeader />
        <EditorContent />
      </div>
    </div>
  );
} 
