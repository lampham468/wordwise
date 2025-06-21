/**
 * grammar.service.ts - Grammar checking service using write-good
 * 
 * Provides grammar checking functionality using the write-good library.
 * Converts grammar check results to our internal Suggestion format.
 */

import writeGood from 'write-good';
import type { Suggestion, SuggestionCategory } from '@/types/suggestions';

/**
 * Configuration for grammar checking
 */
interface GrammarConfig {
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
}

/**
 * Default configuration for grammar checking
 */
const DEFAULT_CONFIG: GrammarConfig = {
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
    eprime: false, // Disabled by default as it can be too strict
  },
  whitelist: [],
};

/**
 * Analyzes text for grammar issues using write-good
 */
export function analyzeGrammar(text: string, config: GrammarConfig = DEFAULT_CONFIG): Suggestion[] {
  if (!text.trim() || !config.enabled) {
    return [];
  }

  try {
    console.log('📝 Analyzing grammar for text:', text.substring(0, 50) + '...');
    
    // Configure write-good options
    const writeGoodOptions: { 
      whitelist: string[];
      [key: string]: boolean | string[] | undefined;
    } = {
      whitelist: config.whitelist || [],
    };

    // Apply check configuration
    if (config.checks) {
      Object.entries(config.checks).forEach(([check, enabled]) => {
        if (enabled === false) {
          writeGoodOptions[check] = false;
        }
      });
    }

    const results = writeGood(text, writeGoodOptions);
    console.log('🔍 Grammar check results:', results);
    
    // Convert to our Suggestion format
    return results.map((result, index) => {
      // Map write-good reasons to our categories
      const getCategoryFromReason = (reason: string): SuggestionCategory => {
        const lowerReason = reason.toLowerCase();
        if (lowerReason.includes('passive voice')) return 'passive-voice';
        if (lowerReason.includes('weasel')) return 'weasel-words';
        if (lowerReason.includes('adverb')) return 'adverb-weakening';
        if (lowerReason.includes('wordy')) return 'too-wordy';
        if (lowerReason.includes('cliche')) return 'cliches';
        return 'general';
      };

      const suggestion: Suggestion = {
        id: `grammar-${Date.now()}-${index}`,
        type: 'grammar' as const,
        category: getCategoryFromReason(result.reason || ''),
        message: result.reason || 'Grammar issue detected',
        original: text.substring(result.index, result.index + result.offset),
        position: {
          start: result.index,
          end: result.index + result.offset,
        },
        engine: 'write-good',
      };
      
      return suggestion;
    });
  } catch (error) {
    console.error('Grammar analysis failed:', error);
    return [];
  }
}

/**
 * Gets grammar suggestions for a specific issue type
 */
export function getGrammarSuggestions(original: string, issueType: string): string[] {
  // Basic suggestions based on common grammar issues
  const suggestions: Record<string, string[]> = {
    'passive voice': [
      original.replace(/is being/, 'being').replace(/was being/, 'being'),
      original.replace(/is/, '').replace(/was/, '').trim(),
    ],
    'weasel word': [
      original.replace(/very/, ''),
      original.replace(/quite/, ''),
      original.replace(/rather/, ''),
    ],
    'wordy': [
      original.replace(/in order to/, 'to'),
      original.replace(/due to the fact that/, 'because'),
      original.replace(/at this point in time/, 'now'),
    ],
  };

  const lowerIssueType = issueType.toLowerCase();
  for (const [type, sug] of Object.entries(suggestions)) {
    if (lowerIssueType.includes(type)) {
      return sug.filter(s => s && s !== original);
    }
  }

  return [];
}

/**
 * Applies a grammar suggestion to text
 */
export function applyGrammarSuggestion(suggestion: Suggestion, text: string): string {
  if (!suggestion.position || !suggestion.original) {
    return text;
  }

  const { start, end } = suggestion.position;
  const before = text.substring(0, start);
  const after = text.substring(end);
  
  // If we have a suggested replacement, use it
  if (suggestion.suggested) {
    return before + suggestion.suggested + after;
  }
  
  // Otherwise, try to generate a suggestion based on the issue type
  const suggestions = getGrammarSuggestions(suggestion.original, suggestion.message);
  if (suggestions.length > 0) {
    return before + suggestions[0] + after;
  }
  
  // Fallback: just remove the problematic text (for weasel words, etc.)
  return before + after;
} 
