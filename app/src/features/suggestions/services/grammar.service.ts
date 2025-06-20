/**
 * grammar.service.ts - Grammar checking service using write-good
 * 
 * Provides grammar analysis functionality using the write-good library.
 * Converts write-good results to our internal Suggestion format.
 */

import writeGood from 'write-good';
import type { Suggestion } from '@/types/suggestions';

/**
 * Result from write-good library
 */
interface WriteGoodResult {
  index: number;
  offset: number;
  reason: string;
}

/**
 * Configuration for write-good analysis
 */
interface GrammarConfig {
  passive?: boolean;
  illusion?: boolean;
  so?: boolean;
  thereIs?: boolean;
  weasel?: boolean;
  adverb?: boolean;
  tooWordy?: boolean;
  cliches?: boolean;
  eprime?: boolean;
}

/**
 * Default configuration for grammar checking
 */
const DEFAULT_CONFIG: GrammarConfig = {
  passive: true,
  illusion: true,
  so: true,
  thereIs: true,
  weasel: true,
  adverb: true,
  tooWordy: true,
  cliches: true,
  eprime: false, // E-Prime is disabled by default as mentioned in docs
};

/**
 * Analyzes text for grammar issues using write-good
 */
export function analyzeGrammar(text: string, _config: GrammarConfig = DEFAULT_CONFIG): Suggestion[] {
  if (!text.trim()) {
    return [];
  }

  try {
    // Run write-good analysis
    const results: WriteGoodResult[] = writeGood(text);
    
    // Convert to our Suggestion format
    return results.map((result, index) => {
      const suggested = getGrammarSuggestion(result.reason, text.substring(result.index, result.index + result.offset));
      
      const suggestion: Suggestion = {
        id: `grammar-${Date.now()}-${index}`,
        type: 'grammar' as const,
        title: getGrammarTitle(result.reason),
        description: result.reason,
        original: text.substring(result.index, result.index + result.offset),
        confidence: getConfidenceScore(result.reason),
        position: {
          start: result.index,
          end: result.index + result.offset,
        },
      };
      
      if (suggested) {
        suggestion.suggested = suggested;
      }
      
      return suggestion;
    });
  } catch (error) {
    console.error('Grammar analysis failed:', error);
    return [];
  }
}

/**
 * Extracts a concise title from the write-good reason
 */
function getGrammarTitle(reason: string): string {
  // Common patterns in write-good reasons
  if (reason.includes('passive voice')) {
    return 'Passive Voice';
  }
  if (reason.includes('weasel word')) {
    return 'Weak Word';
  }
  if (reason.includes('can weaken meaning')) {
    return 'Weakening Word';
  }
  if (reason.includes('wordy') || reason.includes('unnecessary')) {
    return 'Wordy Phrase';
  }
  if (reason.includes('repeated')) {
    return 'Repeated Word';
  }
  if (reason.includes('cliché') || reason.includes('cliche')) {
    return 'Cliché';
  }
  if (reason.includes('omit') && reason.includes('beginning')) {
    return 'Unnecessary Word';
  }
  if (reason.includes('there is') || reason.includes('there are')) {
    return 'Weak Construction';
  }
  
  // Fallback: use first few words
  const words = reason.split(' ').slice(0, 3);
  return words.join(' ').replace(/['"]/g, '');
}

/**
 * Generates a suggested replacement based on the grammar issue
 */
function getGrammarSuggestion(reason: string, _original: string): string | undefined {
  // For passive voice, suggest active voice hint
  if (reason.includes('passive voice')) {
    return 'Consider rewriting in active voice';
  }
  
  // For wordy phrases, suggest removal
  if (reason.includes('wordy') || reason.includes('unnecessary')) {
    return 'Consider removing or simplifying';
  }
  
  // For repeated words, suggest removal
  if (reason.includes('repeated')) {
    return 'Remove duplicate word';
  }
  
  // For "so" at beginning
  if (reason.includes('omit') && reason.includes('beginning')) {
    return 'Remove from sentence start';
  }
  
  // For weak words, suggest strengthening
  if (reason.includes('weasel') || reason.includes('weaken')) {
    return 'Consider a stronger alternative';
  }
  
  // Default: no specific suggestion
  return undefined;
}

/**
 * Assigns confidence score based on the type of grammar issue
 */
function getConfidenceScore(reason: string): number {
  // High confidence issues
  if (reason.includes('repeated') || reason.includes('passive voice')) {
    return 0.9;
  }
  
  // Medium confidence issues
  if (reason.includes('wordy') || reason.includes('unnecessary') || reason.includes('cliché')) {
    return 0.7;
  }
  
  // Lower confidence issues (more subjective)
  if (reason.includes('weasel') || reason.includes('weaken')) {
    return 0.6;
  }
  
  // Default confidence
  return 0.5;
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
  
  // If we have a specific suggestion, use it
  if (suggestion.suggested && !suggestion.suggested.startsWith('Consider')) {
    return before + suggestion.suggested + after;
  }
  
  // For suggestions that are advice (like "Consider..."), we don't auto-apply
  // The user needs to manually edit based on the advice
  return text;
} 
