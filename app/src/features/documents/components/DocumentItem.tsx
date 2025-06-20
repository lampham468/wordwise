/**
 * DocumentItem.tsx
 * 
 * Individual document item component for displaying document metadata
 * in the documents list with selection, preview, and delete functionality.
 */

import type { Document } from '@/types/supabase';
import { useEditorStore } from '../../editor/stores/editor.store';

interface DocumentItemProps {
  document: Document;
  isSelected?: boolean;
  onSelect: (documentNumber: number) => void;
  onDelete: (documentNumber: number, event: React.MouseEvent) => void;
}

/**
 * Document item component
 */
export function DocumentItem({ 
  document, 
  isSelected = false, 
  onSelect, 
  onDelete 
}: DocumentItemProps) {
  const { isDirty, currentDocumentId } = useEditorStore();
  
  // Check if this document has unsaved changes
  const hasUnsavedChanges = isDirty && currentDocumentId === document.number;

  const handleClick = () => {
    onSelect(document.number);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(document.number, e);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getContentPreview = (content: string) => {
    // Strip HTML tags and get first 100 characters
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-4 rounded-xl mb-3 transition-all duration-200 group ${
        isSelected
          ? 'sleek-card shadow-glow bg-gradient-to-r from-primary-50 to-primary-100/50 border-primary-200/50'
          : 'sleek-card hover:shadow-soft hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Document Title with ID and Unsaved Indicator */}
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-sm text-neutral-900 truncate">
              <span className="text-primary-600 font-mono text-xs">[{document.number}]</span>{' '}
              {document.title || 'Untitled'}
            </h4>
            {hasUnsavedChanges && (
              <div 
                className="w-2 h-2 bg-warning-500 rounded-full flex-shrink-0"
                title="Unsaved changes"
              />
            )}
          </div>
          
          {/* Content Preview */}
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
            {getContentPreview(document.content)}
          </p>
          
          {/* Last Updated Date */}
          <p className="text-xs text-neutral-400 mt-2">
            {formatDate(document.updated_at)}
          </p>
        </div>
        
        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-neutral-400 hover:text-error-600 transition-all duration-150"
          title="Delete document"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
        </button>
      </div>
    </button>
  );
} 
