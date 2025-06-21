/**
 * DocumentHeader.tsx
 * 
 * Document header component that displays document title and metadata.
 * Shows title editing interface and save status with statistics.
 */

import { useMemo } from 'react';
import { DocumentTitle } from './DocumentTitle';
import { DocumentMeta } from './DocumentMeta';
import { useDocumentsStore } from '../../documents/stores/documents.store';
import { useEditorStore } from '../stores/editor.store';
import { analyzeText } from '@/utils/text-analysis';
import type { SaveStatus, DocumentStats } from '@/types/supabase';

interface DocumentHeaderProps {
  saveStatus?: SaveStatus;
  stats?: DocumentStats;
}

/**
 * Calculate document statistics from content using proper text analysis
 */
function calculateStats(content: string): DocumentStats {
  const analysis = analyzeText(content);
  
  return {
    wordCount: analysis.words,
    charCount: analysis.characters,
    readabilityScore: analysis.readabilityScore
  };
}

/**
 * Document header with title and metadata
 */
export function DocumentHeader({ 
  saveStatus: propSaveStatus,
  stats: propStats 
}: DocumentHeaderProps) {
  const { currentDocumentId } = useDocumentsStore();
  const { content, isSaving, saveError, isDirty } = useEditorStore();

  // Calculate real-time stats from current content
  const calculatedStats = useMemo(() => {
    return calculateStats(content);
  }, [content]);

  // Use calculated stats if no props provided
  const stats = propStats || calculatedStats;

  // Determine save status from editor store
  const saveStatus = propSaveStatus || (() => {
    if (saveError) return 'error';
    if (isSaving) return 'saving';
    if (isDirty) return 'pending'; // Show pending when content has been modified
    return 'saved'; // Only show saved when content is clean
  })();

  // Show placeholder state if no document is selected
  if (!currentDocumentId) {
    return (
      <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-medium text-gray-400">No document selected</h1>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>0 words</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <DocumentTitle />
      </div>
      
      <div className="flex-shrink-0">
        <DocumentMeta saveStatus={saveStatus} stats={stats} />
      </div>
    </div>
  );
} 
