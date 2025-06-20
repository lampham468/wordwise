/**
 * types/index.ts - Suggestions feature type definitions
 * 
 * Type definitions for the AI suggestions feature
 */

export interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'content' | 'tone';
  title: string;
  description: string;
  original?: string;
  suggested?: string;
  position?: {
    start: number;
    end: number;
  };
}

export type SuggestionType = Suggestion['type'];

export interface SuggestionAction {
  type: 'apply' | 'dismiss';
  suggestionId: string;
}

export interface SuggestionsState {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  activeTab: 'all' | SuggestionType;
}

export interface SuggestionsService {
  analyzeTe: (content: string) => Promise<Suggestion[]>;
  applySuggestion: (suggestion: Suggestion, content: string) => string;
  dismissSuggestion: (suggestionId: string) => void;
} 
