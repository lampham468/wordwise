/**
 * services/index.ts - Suggestions services exports
 * 
 * Centralized exports for all suggestion-related services
 */

// Core writing analysis
export { analyzeWriting, analyzeGrammarOnly, analyzeSpellingOnly, applySuggestion } from './writing.service';

// Individual services
export { analyzeGrammar, applyGrammarSuggestion } from './grammar.service';
export { analyzeSpelling, applySpellingSuggestion } from './spell.service';

// Re-export types would go here if needed 

export * from './ai-suggestions.service'
