/**
 * types/index.ts - Suggestions feature type definitions
 * 
 * Type definitions for the AI suggestions feature
 */

/**
 * Suggestion types for writing assistance
 * 
 * Covers grammar, spelling, and AI-powered style/tone/content suggestions
 */

export type SuggestionType = 
  | 'grammar' 
  | 'spelling' 
  | 'style' 
  | 'tone' 
  | 'content' 
  | 'engagement'

export type SuggestionCategory = 
  | 'passive-voice'
  | 'weasel-words'
  | 'adverb-weakening'
  | 'too-wordy'
  | 'cliches'
  | 'spelling-error'
  | 'clarity'
  | 'engagement' 
  | 'tone-formal'
  | 'tone-casual'
  | 'content-structure'
  | 'content-depth'
  | 'general'

export interface SuggestionPosition {
  start: number
  end: number
}

export interface Suggestion {
  id: string
  type: SuggestionType
  category: SuggestionCategory
  message: string
  position?: SuggestionPosition
  original?: string
  suggested?: string
  confidence?: number
  engine?: 'nspell' | 'write-good' | 'gpt-4o-mini' | 'gpt-4o'
  accepted?: boolean | null
  createdAt?: string
}

export interface WritingAnalysisResult {
  suggestions: Suggestion[]
  stats: {
    total: number
    byType: Record<SuggestionType, number>
    confidence: number
  }
  contentHash?: string
}

export interface AISuggestionContext {
  audience?: string
  purpose?: string
  previousDocuments?: string[]
}

export interface AISuggestionRequest {
  text: string
  analysisTypes: SuggestionType[]
  context?: AISuggestionContext
  userId?: string
  documentNumber?: number
}

export interface AISuggestionResponse {
  suggestions: Suggestion[]
  contentHash: string
}

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
