/**
 * DocumentSearchBar.tsx
 * 
 * Collapsible search bar component that starts as an icon and expands 
 * to show the full search input when clicked.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface DocumentSearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
}

/**
 * Collapsible document search bar with expand/collapse functionality
 */
export function DocumentSearchBar({
  value = '',
  placeholder = 'Search documents...',
  onSearch,
  debounceMs = 300,
  className = '',
  disabled = false,
  onExpandChange
}: DocumentSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create debounced search function
  const debouncedSearch = useDebounce(onSearch, debounceMs);

  // Sync external value changes to local state
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger search when local value changes
  useEffect(() => {
    if (localValue !== value) {
      debouncedSearch(localValue);
    }
  }, [localValue, value, debouncedSearch]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Auto-expand if there's a search value
  useEffect(() => {
    if (value && !isExpanded) {
      setIsExpanded(true);
    }
  }, [value, isExpanded]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    onExpandChange?.(true);
  }, [onExpandChange]);

  const handleCollapse = useCallback(() => {
    if (!localValue) {
      setIsExpanded(false);
      onExpandChange?.(false);
    }
  }, [localValue, onExpandChange]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onSearch('');
    setIsExpanded(false);
    onExpandChange?.(false);
  }, [onSearch, onExpandChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (localValue) {
        handleClear();
      } else {
        setIsExpanded(false);
        onExpandChange?.(false);
      }
    }
  }, [localValue, handleClear, onExpandChange]);

  return (
    <div className={`relative ${className}`}>
      {!isExpanded ? (
        // Collapsed state - just the search icon with same styling as + button
        <button
          onClick={handleExpand}
          disabled={disabled}
          className="sleek-button w-full h-12 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center transition-all duration-200"
          aria-label="Expand search"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      ) : (
        // Expanded state - full search input
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleCollapse}
            placeholder="Search..."
            disabled={disabled}
            className="modern-input w-full h-12 px-4 pl-14 pr-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            aria-label="Search documents"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Clear Button */}
          {localValue && !disabled && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-all duration-200 hover:bg-white/20 rounded-r-xl"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Loading Spinner */}
          {disabled && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="animate-spin h-4 w-4 border-2 border-neutral-300 border-t-primary-500 rounded-full"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
