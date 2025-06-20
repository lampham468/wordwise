/**
 * SuggestionsPopover.tsx
 * 
 * Popover component for displaying spell check and grammar suggestions.
 * Provides an interactive interface for users to accept, ignore, or add words.
 */

import { useState, useEffect, useRef } from 'react';

export interface SuggestionError {
  word: string;
  start: number;
  end: number;
  suggestions: string[];
  type: 'spelling' | 'grammar' | 'style';
  message?: string;
}

interface SuggestionsPopoverProps {
  error: SuggestionError | null;
  position: { x: number; y: number } | null;
  onReplace: (replacement: string) => void;
  onIgnore: () => void;
  onAddToDictionary?: () => void;
  onClose: () => void;
}

/**
 * Suggestions popover component
 */
export function SuggestionsPopover({
  error,
  position,
  onReplace,
  onIgnore,
  onAddToDictionary,
  onClose
}: SuggestionsPopoverProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Extract error properties with defaults
  const word = error?.word || '';
  const suggestions = error?.suggestions || [];
  const type = error?.type || 'spelling';
  const message = error?.message;
  const hasAddToDictionary = type === 'spelling' && onAddToDictionary;

  // Reset selected index when error changes
  useEffect(() => {
    if (error) {
      setSelectedIndex(0);
    }
  }, [error]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!error) return;

      const maxIndex = suggestions.length + (hasAddToDictionary ? 1 : 1); // suggestions + ignore (+ add to dictionary)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % maxIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + maxIndex) % maxIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex < suggestions.length) {
            const suggestion = suggestions[selectedIndex];
            if (suggestion) {
              onReplace(suggestion);
            }
          } else if (selectedIndex === suggestions.length && hasAddToDictionary) {
            onAddToDictionary();
          } else {
            onIgnore();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [error, selectedIndex, suggestions, hasAddToDictionary, onReplace, onIgnore, onAddToDictionary, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Don't render if no error or position
  if (!error || !position) {
    return null;
  }

  // Get type-specific styling
  const getTypeStyles = () => {
    switch (type) {
      case 'spelling':
        return {
          border: 'border-error-200',
          header: 'bg-error-50 text-error-800',
          icon: '🔤'
        };
      case 'grammar':
        return {
          border: 'border-warning-200',
          header: 'bg-warning-50 text-warning-800',
          icon: '📝'
        };
      case 'style':
        return {
          border: 'border-primary-200',
          header: 'bg-primary-50 text-primary-800',
          icon: '✨'
        };
      default:
        return {
          border: 'border-neutral-200',
          header: 'bg-neutral-50 text-neutral-800',
          icon: '💡'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      ref={popoverRef}
      className={`fixed z-50 bg-white rounded-lg shadow-lg border-2 ${styles.border} min-w-64 max-w-80`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -120%)'
      }}
    >
      {/* Header */}
      <div className={`px-3 py-2 rounded-t-lg ${styles.header} border-b border-current border-opacity-20`}>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{styles.icon}</span>
          <span className="font-medium text-sm capitalize">
            {type === 'spelling' ? 'Spelling' : type === 'grammar' ? 'Grammar' : 'Style'} Suggestion
          </span>
        </div>
        {message && (
          <p className="text-xs mt-1 opacity-80">{message}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Current word */}
        <div className="px-2 py-1 mb-2 bg-neutral-100 rounded text-sm">
          <span className="text-neutral-600">Original: </span>
          <span className="font-mono font-medium">"{word}"</span>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-neutral-600 mb-1 px-2">Suggestions:</div>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                    selectedIndex === index
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                  onClick={() => onReplace(suggestion)}
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-neutral-200 pt-2 space-y-1">
          {hasAddToDictionary && (
            <button
              className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                selectedIndex === suggestions.length
                  ? 'bg-primary-100 text-primary-800 font-medium'
                  : 'hover:bg-neutral-100 text-neutral-700'
              }`}
              onClick={onAddToDictionary}
            >
              Add "{word}" to dictionary
            </button>
          )}
          <button
            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
              selectedIndex === suggestions.length + (hasAddToDictionary ? 1 : 0)
                ? 'bg-primary-100 text-primary-800 font-medium'
                : 'hover:bg-neutral-100 text-neutral-700'
            }`}
            onClick={onIgnore}
          >
            Ignore "{word}"
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="px-3 py-1 bg-neutral-50 rounded-b-lg border-t border-neutral-200 text-xs text-neutral-500">
        Use ↑↓ to navigate, Enter to select, Esc to close
      </div>
    </div>
  );
} 
