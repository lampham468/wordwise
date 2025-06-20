/**
 * useSpellCheck.ts - Hook for spell checking integration
 * 
 * Integrates nspell spell checking with editor content changes.
 * Provides debounced analysis and manages suggestions state.
 */

import { useEffect, useCallback, useState } from 'react';
import { useSuggestionsStore } from '../stores/suggestions.store';
import { analyzeSpelling } from '../services/spell.service';
import type { Suggestion } from '@/types/suggestions';

/**
 * Hook for spell checking integration
 */
export function useSpellCheck(content: string, enabled: boolean = true) {
  const {
    setSuggestions,
    setAnalyzing,
    setError,
    suggestions,
    isAnalyzing,
    error,
  } = useSuggestionsStore();

  // Simple debounced content state
  const [debouncedContent, setDebouncedContent] = useState(content);

  // Update debounced content with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  // Analyze spell check with error handling
  const analyzeContent = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      
      // Run spell checking analysis (now async)
      const spellingSuggestions = await analyzeSpelling(text);
      
      // Get current suggestions from store and update without circular dependency
      const currentSuggestions = useSuggestionsStore.getState().suggestions;
      const existingSuggestions = currentSuggestions.filter((s: Suggestion) => s.type !== 'grammar');
      const allSuggestions = [...existingSuggestions, ...spellingSuggestions];
      
      setSuggestions(allSuggestions);
    } catch (err) {
      console.error('Spell check failed:', err);
      setError(err instanceof Error ? err.message : 'Spell check failed');
    } finally {
      setAnalyzing(false);
    }
  }, [enabled, setSuggestions, setAnalyzing, setError]);

  // Run analysis when debounced content changes
  useEffect(() => {
    analyzeContent(debouncedContent);
  }, [debouncedContent, analyzeContent]);

  // Manual trigger for immediate analysis
  const triggerAnalysis = useCallback(() => {
    analyzeContent(content);
  }, [content, analyzeContent]);

  return {
    isAnalyzing,
    error,
    triggerAnalysis,
    spellingSuggestions: suggestions.filter(s => s.type === 'grammar'), // Keep type as 'grammar' for now
  };
} 
