/**
 * DocumentMeta.tsx
 * 
 * Document metadata display component showing save status and statistics.
 * Provides visual feedback for save states and document metrics.
 */

import { useMemo } from 'react';
import { useEditorStore } from '../stores/editor.store';
import { getReadabilityLevel } from '@/utils/text-analysis';
import type { DocumentStats, SaveStatus } from '@/types/supabase';

interface DocumentMetaProps {
  saveStatus: SaveStatus;
  stats: DocumentStats;
}

/**
 * Map readability color to Tailwind classes
 */
function getReadabilityColorClass(color: 'success' | 'warning' | 'error' | 'neutral'): string {
  switch (color) {
    case 'success':
      return 'text-success-600';
    case 'warning':
      return 'text-warning-600';
    case 'error':
      return 'text-error-600';
    default:
      return 'text-neutral-600';
  }
}

/**
 * Document metadata component
 * Shows save status, word count, character count, and readability score
 */
export function DocumentMeta({ saveStatus, stats }: DocumentMetaProps) {
  const { saveError, clearSaveError, content } = useEditorStore();
  
  // Get detailed readability analysis
  const readabilityAnalysis = useMemo(() => {
    if (!content || stats.readabilityScore === undefined) {
      return getReadabilityLevel(0);
    }
    return getReadabilityLevel(stats.readabilityScore);
  }, [content, stats.readabilityScore]);

  const readabilityColorClass = getReadabilityColorClass(readabilityAnalysis.color);

  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center space-x-1 text-primary-600">
            <div className="animate-spin w-3 h-3 border border-primary-600 border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center space-x-1 text-success-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 text-error-600">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Save failed</span>
            </div>
            {saveError && (
              <button
                onClick={clearSaveError}
                className="ml-1 text-xs text-error-500 hover:text-error-700 underline transition-colors duration-75"
                title={saveError}
              >
                (details)
              </button>
            )}
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-1 text-warning-600">
            <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Auto-save pending...</span>
          </div>
        );
      default:
        return (
          <div className="text-sm text-neutral-500">
            Ready
          </div>
        );
    }
  };

  return (
    <div className="flex items-center space-x-3 text-xs">
      {/* Save Status */}
      <div className="flex items-center">
        {getSaveStatusDisplay()}
      </div>

      {/* Document Statistics */}
      <div className="flex items-center space-x-2 text-gray-600">
        <span>{stats.wordCount} words</span>
        <span>•</span>
        <span>{stats.charCount} chars</span>
        <span>•</span>
        <span 
          className={`${readabilityColorClass}`}
          title={`Flesch-Kincaid Grade Level: ${stats.readabilityScore || 0} (${readabilityAnalysis.description})`}
        >
          Grade {stats.readabilityScore ? stats.readabilityScore.toFixed(1) : '0.0'}
        </span>
      </div>
    </div>
  );
} 
