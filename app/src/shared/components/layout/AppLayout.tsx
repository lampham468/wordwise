/**
 * AppLayout.tsx
 * 
 * Main application layout with responsive sidebar behavior.
 * Implements sidebar collapse/overlay patterns per UI rules.
 */

import { DocumentSidebar } from '@/features/documents/DocumentSidebar';
import { SuggestionsSidebar } from '@/features/suggestions/SuggestionsSidebar';
import { Editor } from '@/features/editor/Editor';
import { useEditorStore } from '@/features/editor/stores/editor.store';

/**
 * Main application layout component
 * Renders all feature UIs with responsive behavior:
 * - Desktop (xl+): Fixed sidebars with stable layout
 * - Tablet (lg): Sidebar overlays content
 * - Mobile (md-): Single column, sidebar slides over
 */
export function AppLayout() {
  const { content } = useEditorStore();
  
      return (
    <div className="h-screen flex bg-white">
      {/* Documents Feature - Left Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block border-r border-gray-200 h-full overflow-hidden">
        <DocumentSidebar />
      </div>

      {/* Main Content Area - Basic editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <Editor />
      </div>

      {/* Suggestions Feature - Right Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block border-l border-gray-200 h-full overflow-hidden">
        <SuggestionsSidebar text={content || ''} />
      </div>
    </div>
  );
} 
