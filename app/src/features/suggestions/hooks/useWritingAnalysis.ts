/**
 * useWritingAnalysis.ts - Hook for comprehensive writing analysis
 * 
 * Integrates both grammar checking (write-good) and spell checking (nspell)
 * with editor content changes. Provides debounced analysis and manages suggestions state.
 */

import { useEffect, useCallback, useState } from 'react';
import { useSuggestionsStore } from '../stores/suggestions.store';
import { analyzeWriting } from '../services/writing.service';

/**
 * Configuration for writing analysis
 */
interface WritingAnalysisConfig {
  grammar?: {
    enabled?: boolean;
    checks?: {
      passive?: boolean;
      illusion?: boolean;
      so?: boolean;
      thereIs?: boolean;
      weasel?: boolean;
      adverb?: boolean;
      tooWordy?: boolean;
      cliches?: boolean;
      eprime?: boolean;
    };
    whitelist?: string[];
  };
  spelling?: {
    enabled?: boolean;
    maxSuggestions?: number;
    minWordLength?: number;
  };
}

/**
 * Hook for comprehensive writing analysis (grammar + spelling)
 */
export function useWritingAnalysis(
  content: string, 
  enabled: boolean = true,
  config?: WritingAnalysisConfig
) {
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

  // Analyze writing with comprehensive error handling
  const analyzeContent = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      
      console.log('🔍 Starting comprehensive writing analysis...');
      
      // Run comprehensive writing analysis (grammar + spelling)
      const writingSuggestions = await analyzeWriting(text, config);
      
      console.log(`📝 Analysis complete: ${writingSuggestions.length} suggestions found`);
      setSuggestions(writingSuggestions);
      
    } catch (err) {
      console.error('Writing analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Writing analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, [enabled, config]);

  // Run analysis when debounced content changes
  useEffect(() => {
    analyzeContent(debouncedContent);
  }, [debouncedContent, analyzeContent]);

  // Manual trigger for immediate analysis
  const triggerAnalysis = useCallback(() => {
    analyzeContent(content);
  }, [content, analyzeContent]);

  // Separate suggestions by source for easier access
  const grammarSuggestions = suggestions.filter(s => s.id.startsWith('grammar-'));
  const spellingSuggestions = suggestions.filter(s => s.id.startsWith('spelling-'));

  return {
    isAnalyzing,
    error,
    triggerAnalysis,
    suggestions,
    grammarSuggestions,
    spellingSuggestions,
    stats: {
      total: suggestions.length,
      grammar: grammarSuggestions.length,
      spelling: spellingSuggestions.length,
    },
  };
} 
