/**
 * useGrammarAnalysis.ts - Hook for grammar analysis integration
 * 
 * Integrates write-good grammar analysis with editor content changes.
 * Provides debounced analysis and manages suggestions state.
 */

import { useEffect, useCallback, useState } from 'react';
import { useSuggestionsStore } from '../stores/suggestions.store';
import { analyzeGrammar } from '../services/grammar.service';

/**
 * Hook for grammar analysis integration
 */
export function useGrammarAnalysis(content: string, enabled: boolean = true) {
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

  // Analyze grammar with error handling
  const analyzeContent = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      
      // Run grammar analysis
      const grammarSuggestions = analyzeGrammar(text);
      
      // Filter out existing non-grammar suggestions and add new grammar ones
      const existingSuggestions = suggestions.filter(s => s.type !== 'grammar');
      const allSuggestions = [...existingSuggestions, ...grammarSuggestions];
      
      setSuggestions(allSuggestions);
    } catch (err) {
      console.error('Grammar analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Grammar analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, [enabled, setSuggestions, setAnalyzing, setError, suggestions]);

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
    grammarSuggestions: suggestions.filter(s => s.type === 'grammar'),
  };
} 
