/**
 * AppLayout.tsx
 * 
 * Main application layout with responsive sidebar behavior.
 * Implements sidebar collapse/overlay patterns per UI rules.
 */

import { DocumentSidebar } from '@/features/documents/DocumentSidebar';
import { SuggestionsSidebar } from '@/features/suggestions/SuggestionsSidebar';
import { Editor } from '@/features/editor/Editor';

/**
 * Main application layout component
 * Renders all feature UIs with responsive behavior:
 * - Desktop (xl+): Fixed sidebars
 * - Tablet (lg): Sidebar overlays content
 * - Mobile (md-): Single column, sidebar slides over
 */
export function AppLayout() {
  return (
    <div className="h-full flex bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-100">
      {/* Documents Feature - Left Sidebar */}
      <div className="sidebar-width flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-50 xl:relative xl:z-auto hidden lg:block">
        <div className="h-full glass-panel rounded-r-2xl">
          <DocumentSidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-80 xl:ml-0 pt-6 px-6 shadow-paper">
        {/* Editor with integrated header and content - flush to bottom */}
        <div className="flex-1 w-full editor-card rounded-t-2xl overflow-hidden">
          <Editor />
        </div>
      </div>

      {/* Suggestions Feature - Right Sidebar */}
      <div className="flex-shrink-0 hidden xl:block">
        <div className="h-full glass-panel rounded-l-2xl">
          <SuggestionsSidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay (when needed) */}
      <div className="lg:hidden fixed inset-0 z-50 hidden" id="mobile-sidebar-overlay">
        <div className="fixed inset-0 bg-neutral-900/50" />
        <div className="fixed inset-y-0 left-0 sidebar-width bg-white">
          <DocumentSidebar />
        </div>
      </div>
    </div>
  );
} 
