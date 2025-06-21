/**
 * writing.service.ts - Combined writing analysis service
 * 
 * Coordinates between grammar checking (write-good) and spell checking (nspell)
 * to provide comprehensive writing assistance.
 */

import { analyzeGrammar } from './grammar.service';
import { analyzeSpelling } from './spell.service';
import type { Suggestion } from '@/types/suggestions';

/**
 * Configuration for writing analysis
 */
interface WritingConfig {
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
 * Default configuration for writing analysis
 */
const DEFAULT_CONFIG: WritingConfig = {
  grammar: {
    enabled: true,
    checks: {
      passive: true,
      illusion: true,
      so: true,
      thereIs: true,
      weasel: true,
      adverb: true,
      tooWordy: true,
      cliches: true,
      eprime: false,
    },
    whitelist: [],
  },
  spelling: {
    enabled: true,
    maxSuggestions: 5,
    minWordLength: 3,
  },
};

/**
 * Analyzes text for both grammar and spelling issues
 */
export async function analyzeWriting(text: string, config: WritingConfig = DEFAULT_CONFIG): Promise<Suggestion[]> {
  if (!text.trim()) {
    return [];
  }

  const suggestions: Suggestion[] = [];

  try {
    // Run grammar analysis (synchronous)
    if (config.grammar?.enabled !== false) {
      console.log('🔍 Running grammar analysis...');
      const grammarSuggestions = analyzeGrammar(text, config.grammar);
      suggestions.push(...grammarSuggestions);
    }

    // Run spell checking (asynchronous)
    if (config.spelling?.enabled !== false) {
      console.log('🔍 Running spell checking...');
      const spellingSuggestions = await analyzeSpelling(text);
      suggestions.push(...spellingSuggestions);
    }

    // Sort suggestions by position for consistent ordering
    suggestions.sort((a, b) => {
      if (!a.position || !b.position) return 0;
      return a.position.start - b.position.start;
    });

    console.log(`✅ Writing analysis complete: ${suggestions.length} suggestions found`);
    return suggestions;

  } catch (error) {
    console.error('Writing analysis failed:', error);
    throw error;
  }
}

/**
 * Analyzes only grammar issues (synchronous)
 */
export function analyzeGrammarOnly(text: string, config?: WritingConfig['grammar']): Suggestion[] {
  return analyzeGrammar(text, config);
}

/**
 * Analyzes only spelling issues (asynchronous)
 */
export async function analyzeSpellingOnly(text: string): Promise<Suggestion[]> {
  return analyzeSpelling(text);
}

/**
 * Applies a suggestion to text based on its type
 */
export function applySuggestion(suggestion: Suggestion, text: string): string {
  if (!suggestion.position || !suggestion.original) {
    return text;
  }

  const { start, end } = suggestion.position;
  const before = text.substring(0, start);
  const after = text.substring(end);
  
  // Use the suggested replacement if available
  if (suggestion.suggested) {
    return before + suggestion.suggested + after;
  }
  
  // For grammar issues without suggestions, remove the problematic text
  if (suggestion.type === 'grammar') {
    return before + after;
  }
  
  // For spelling issues without suggestions, keep the original
  return text;
} 
