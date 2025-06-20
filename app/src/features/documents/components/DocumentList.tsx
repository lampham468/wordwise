/**
 * DocumentList.tsx
 * 
 * Scrollable list component for displaying multiple document items.
 * Handles loading states, empty states, and renders DocumentItem components.
 */

import { DocumentItem } from './DocumentItem';
import type { Document } from '../stores/documents.store';

interface DocumentListProps {
  documents: Document[];
  currentDocumentId: number | null;
  isLoading?: boolean;
  searchQuery?: string;
  onDocumentSelect: (documentNumber: number) => void;
  onDocumentDelete: (documentNumber: number, event: React.MouseEvent) => void;
}

/**
 * Scrollable document list component
 * 
 * @param documents - Array of documents to display
 * @param currentDocumentId - ID of currently selected document
 * @param isLoading - Whether documents are being loaded
 * @param searchQuery - Current search query for empty state messaging
 * @param onDocumentSelect - Callback when a document is selected
 * @param onDocumentDelete - Callback when document deletion is requested
 */
export function DocumentList({
  documents,
  currentDocumentId,
  isLoading = false,
  searchQuery = '',
  onDocumentSelect,
  onDocumentDelete
}: DocumentListProps) {

  // Loading state with skeleton items
  if (isLoading && documents.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 text-center text-neutral-500">
          <p className="text-sm">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </p>
          {!searchQuery && (
            <p className="text-xs mt-1">Create your first document to get started!</p>
          )}
        </div>
      </div>
    );
  }

  // Document list
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        {documents.map((document) => (
          <DocumentItem
            key={document.number}
            document={document}
            isSelected={currentDocumentId === document.number}
            onSelect={onDocumentSelect}
            onDelete={onDocumentDelete}
          />
        ))}
      </div>
    </div>
  );
} 
